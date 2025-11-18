import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import {
	CreateCourseReviewResponseSchema,
	CourseReviewSchema,
} from "@/gen/courses/v1/course_reviews_pb"
import type {
	CreateCourseReviewRequest,
	CreateCourseReviewResponse,
} from "@/gen/courses/v1/course_reviews_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { courseReview, course, enrollment } from "@/schema/schema"
import { and, eq } from "drizzle-orm"
import { v7 as uuidv7 } from "uuid"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function createCourseReview(
	req: CreateCourseReviewRequest,
	context: HandlerContext
): Promise<CreateCourseReviewResponse> {
	// Require authentication
	const session = await requireAuth(context)

	// Always use the authenticated user from session for security
	const userId = session.user.id
	const courseId = uuidToHexString(req.courseId)

	// Verify course exists
	const courseData = await db.query.course.findFirst({
		where: eq(course.id, courseId),
	})

	if (!courseData) {
		throw new ConnectError("Course not found", Code.NotFound)
	}

	// Check if user is enrolled in this course (must be completed)
	const userEnrollment = await db.query.enrollment.findFirst({
		where: (enrollment, { and, eq }) =>
			and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)),
	})

	if (!userEnrollment) {
		throw new ConnectError(
			"You must be enrolled in this course to review it",
			Code.FailedPrecondition
		)
	}

	if (userEnrollment.status !== "completed") {
		throw new ConnectError(
			"You must complete the course before reviewing it",
			Code.FailedPrecondition
		)
	}

	// Check if user already has a review for this course
	const existingReview = await db.query.courseReview.findFirst({
		where: (review, { and, eq }) => and(eq(review.userId, userId), eq(review.courseId, courseId)),
	})

	if (existingReview) {
		throw new ConnectError("User already has a review for this course", Code.AlreadyExists)
	}

	// Create review
	const reviewId = uuidv7()
	const now = new Date()

	await db.insert(courseReview).values({
		id: reviewId,
		courseId,
		userId,
		rating: req.rating,
		comment: req.comment || null,
		createdAt: now,
		updatedAt: now,
	})

	// Update course statistics
	const allReviews = await db.query.courseReview.findMany({
		where: eq(courseReview.courseId, courseId),
		columns: {
			rating: true,
		},
	})

	const totalReview = allReviews.length
	const averageRating =
		totalReview > 0 ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReview : 0

	// Get total customers (enrollments with status 'completed')
	const completedEnrollments = await db.query.enrollment.findMany({
		where: and(eq(enrollment.courseId, courseId), eq(enrollment.status, "completed")),
		columns: {
			id: true,
		},
	})

	const totalCustomer = completedEnrollments.length

	await db
		.update(course)
		.set({
			averageRating,
			totalReview,
			totalCustomer,
		})
		.where(eq(course.id, courseId))

	// Fetch the created review
	const createdReview = await db.query.courseReview.findFirst({
		where: eq(courseReview.id, reviewId),
	})

	if (!createdReview) {
		throw new ConnectError("Failed to create review", Code.Internal)
	}

	// Create review proto message
	const reviewProto = create(CourseReviewSchema, {
		id: hexStringToUuid(createdReview.id),
		courseId: hexStringToUuid(createdReview.courseId),
		userId: hexStringToUuid(createdReview.userId),
		rating: createdReview.rating,
		comment: createdReview.comment || "",
		createdAt: BigInt(Math.floor(createdReview.createdAt.getTime() / 1000)),
		updatedAt: BigInt(Math.floor(createdReview.updatedAt.getTime() / 1000)),
	})

	return create(CreateCourseReviewResponseSchema, {
		review: reviewProto,
	})
}
