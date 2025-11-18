import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { CreateEnrollmentResponseSchema, EnrollmentSchema } from "@/gen/courses/v1/enrollments_pb"
import type {
	CreateEnrollmentRequest,
	CreateEnrollmentResponse,
} from "@/gen/courses/v1/enrollments_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { course, enrollment, user } from "@/schema/schema"
import { eq } from "drizzle-orm"
import Stripe from "stripe"
import { env } from "@/utils/env"
import { v7 as uuidv7 } from "uuid"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-10-29.clover",
})

export async function createEnrollment(
	req: CreateEnrollmentRequest,
	context: HandlerContext
): Promise<CreateEnrollmentResponse> {
	// Require authentication
	const session = await requireAuth(context)

	// Always use the authenticated user from session for security
	const userId = session.user.id
	const courseId = uuidToHexString(req.courseId)

	// Get course details from database
	const courseData = await db.query.course.findFirst({
		where: eq(course.id, courseId),
	})

	if (!courseData) {
		throw new ConnectError("Course not found", Code.NotFound)
	}

	// Check if user is already enrolled
	const existingEnrollment = await db.query.enrollment.findFirst({
		where: (enrollment, { and, eq }) =>
			and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)),
	})

	if (existingEnrollment?.status === "completed") {
		throw new ConnectError("Already enrolled", Code.AlreadyExists)
	}

	// Get user's Stripe customer ID from session (customSession plugin includes it)
	const sessionStripeCustomerId = session.user.stripeCustomerId

	let stripeCustomerId: string

	// Create Stripe customer if one doesn't exist
	if (!sessionStripeCustomerId) {
		if (!env.STRIPE_SECRET_KEY) {
			throw new ConnectError(
				"Stripe customer not found. Please complete your profile.",
				Code.FailedPrecondition
			)
		}

		const customer = await stripe.customers.create({
			email: session.user.email || undefined,
			name: session.user.name || undefined,
			metadata: {
				userId,
			},
		})

		// Update user with Stripe customer ID
		await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, userId))

		stripeCustomerId = customer.id
	} else {
		stripeCustomerId = sessionStripeCustomerId
	}

	// Create enrollment record
	const enrollmentId = uuidv7()

	await db.insert(enrollment).values({
		id: enrollmentId,
		userId,
		courseId,
		status: "pending",
	})

	// Create Stripe Checkout Session for one-time payment
	if (!env.STRIPE_SECRET_KEY) {
		throw new ConnectError(
			"Stripe is not configured. Please set STRIPE_SECRET_KEY.",
			Code.FailedPrecondition
		)
	}

	const checkoutSession = await stripe.checkout.sessions.create({
		customer: stripeCustomerId,
		payment_method_types: ["card"],
		mode: "payment", // One-time payment, not subscription
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: courseData.title,
						description: courseData.description || undefined,
						images: courseData.image ? [courseData.image] : undefined,
					},
					unit_amount: courseData.price * 100, // Convert to cents
				},
				quantity: 1,
			},
		],
		success_url: `${env.NEXT_PUBLIC_BASE_URL}/dashboard?enrolled=true`,
		cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
		metadata: {
			enrollmentId,
			courseId,
			userId,
		},
	})

	// Update enrollment with checkout session ID
	await db
		.update(enrollment)
		.set({ stripeCheckoutSessionId: checkoutSession.id })
		.where(eq(enrollment.id, enrollmentId))

	// Create enrollment proto message
	const enrollmentProto = create(EnrollmentSchema, {
		id: hexStringToUuid(enrollmentId),
		userId: hexStringToUuid(userId),
		courseId: hexStringToUuid(courseId),
		status: 1, // ENROLLMENT_STATUS_PENDING
		stripeCheckoutSessionId: checkoutSession.id,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	})

	return create(CreateEnrollmentResponseSchema, {
		enrollment: enrollmentProto,
		checkoutUrl: checkoutSession.url || "",
	})
}
