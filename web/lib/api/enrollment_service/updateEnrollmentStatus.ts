import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import {
	UpdateEnrollmentStatusResponseSchema,
	EnrollmentSchema,
} from "@/gen/courses/v1/enrollments_pb"
import type {
	UpdateEnrollmentStatusRequest,
	UpdateEnrollmentStatusResponse,
} from "@/gen/courses/v1/enrollments_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { enrollment } from "@/schema/schema"
import { eq } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function updateEnrollmentStatus(
	req: UpdateEnrollmentStatusRequest,
	context: HandlerContext
): Promise<UpdateEnrollmentStatusResponse> {
	// Require authentication
	await requireAuth(context)

	const enrollmentId = uuidToHexString(req.id)

	// Check if enrollment exists
	const existingEnrollment = await db.query.enrollment.findFirst({
		where: eq(enrollment.id, enrollmentId),
	})

	if (!existingEnrollment) {
		throw new ConnectError("Enrollment not found", Code.NotFound)
	}

	// Map enum to status string
	const statusMap: Record<number, string> = {
		1: "pending",
		2: "completed",
		3: "failed",
	}

	const statusString = statusMap[req.status]
	if (!statusString) {
		throw new ConnectError("Invalid enrollment status", Code.InvalidArgument)
	}

	// Build update object
	const updates: {
		status: string
		stripePaymentIntentId?: string
		stripeCheckoutSessionId?: string
	} = {
		status: statusString,
	}

	if (req.stripePaymentIntentId) {
		updates.stripePaymentIntentId = req.stripePaymentIntentId
	}

	if (req.stripeCheckoutSessionId) {
		updates.stripeCheckoutSessionId = req.stripeCheckoutSessionId
	}

	// Update enrollment
	await db.update(enrollment).set(updates).where(eq(enrollment.id, enrollmentId))

	// Fetch updated enrollment
	const updatedEnrollment = await db.query.enrollment.findFirst({
		where: eq(enrollment.id, enrollmentId),
	})

	if (!updatedEnrollment) {
		throw new ConnectError("Failed to update enrollment", Code.Internal)
	}

	const enrollmentProto = create(EnrollmentSchema, {
		id: req.id,
		userId: hexStringToUuid(updatedEnrollment.userId),
		courseId: hexStringToUuid(updatedEnrollment.courseId),
		status: req.status,
		stripePaymentIntentId: updatedEnrollment.stripePaymentIntentId || undefined,
		stripeCheckoutSessionId: updatedEnrollment.stripeCheckoutSessionId || undefined,
		createdAt: updatedEnrollment.createdAt.toISOString(),
		updatedAt: updatedEnrollment.updatedAt.toISOString(),
	})

	return create(UpdateEnrollmentStatusResponseSchema, {
		enrollment: enrollmentProto,
	})
}
