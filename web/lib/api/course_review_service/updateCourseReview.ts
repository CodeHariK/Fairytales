import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import {
	UpdateCourseReviewResponseSchema,
	CourseReviewSchema,
} from "@/gen/courses/v1/course_reviews_pb"
import type {
	UpdateCourseReviewRequest,
	UpdateCourseReviewResponse,
} from "@/gen/courses/v1/course_reviews_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { courseReview, course, enrollment } from "@/schema/schema"
import { and, eq } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function updateCourseReview(
	req: UpdateCourseReviewRequest,
	context: HandlerContext
): Promise<UpdateCourseReviewResponse> {
	// Require authentication
	const session = await requireAuth(context)

	const reviewId = uuidToHexString(req.id)

	// Fetch existing review
	const existingReview = await db.query.courseReview.findFirst({
		where: eq(courseReview.id, reviewId),
	})

	if (!existingReview) {
		throw new ConnectError("Review not found", Code.NotFound)
	}

	// Verify user owns this review
	if (existingReview.userId !== session.user.id) {
		throw new ConnectError("Forbidden", Code.PermissionDenied)
	}

	// Verify user is enrolled in the course (must be completed)
	const userEnrollment = await db.query.enrollment.findFirst({
		where: (enrollment, { and, eq }) =>
			and(eq(enrollment.userId, session.user.id), eq(enrollment.courseId, existingReview.courseId)),
	})

	if (!userEnrollment || userEnrollment.status !== "completed") {
		throw new ConnectError(
			"You must complete the course before reviewing it",
			Code.FailedPrecondition
		)
	}

	// Build update object
	const updateData: {
		rating?: number
		comment?: string | null
		updatedAt: Date
	} = {
		updatedAt: new Date(),
	}

	if (req.rating !== undefined) {
		updateData.rating = req.rating
	}

	if (req.comment !== undefined) {
		updateData.comment = req.comment || null
	}

	// Update review
	await db.update(courseReview).set(updateData).where(eq(courseReview.id, reviewId))

	// Update course statistics
	const allReviews = await db.query.courseReview.findMany({
		where: eq(courseReview.courseId, existingReview.courseId),
		columns: {
			rating: true,
		},
	})

	const totalReview = allReviews.length
	const averageRating =
		totalReview > 0 ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReview : 0

	// Get total customers (enrollments with status 'completed')
	const completedEnrollments = await db.query.enrollment.findMany({
		where: and(
			eq(enrollment.courseId, existingReview.courseId),
			eq(enrollment.status, "completed")
		),
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
		.where(eq(course.id, existingReview.courseId))

	// Fetch the updated review
	const updatedReview = await db.query.courseReview.findFirst({
		where: eq(courseReview.id, reviewId),
	})

	if (!updatedReview) {
		throw new ConnectError("Failed to update review", Code.Internal)
	}

	// Create review proto message
	const reviewProto = create(CourseReviewSchema, {
		id: hexStringToUuid(updatedReview.id),
		courseId: hexStringToUuid(updatedReview.courseId),
		userId: hexStringToUuid(updatedReview.userId),
		rating: updatedReview.rating,
		comment: updatedReview.comment || "",
		createdAt: BigInt(Math.floor(updatedReview.createdAt.getTime() / 1000)),
		updatedAt: BigInt(Math.floor(updatedReview.updatedAt.getTime() / 1000)),
	})

	return create(UpdateCourseReviewResponseSchema, {
		review: reviewProto,
	})
}
