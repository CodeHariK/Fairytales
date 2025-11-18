import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { DeleteCourseReviewResponseSchema } from "@/gen/courses/v1/course_reviews_pb"
import type {
	DeleteCourseReviewRequest,
	DeleteCourseReviewResponse,
} from "@/gen/courses/v1/course_reviews_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { courseReview, course, enrollment } from "@/schema/schema"
import { and, eq } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { uuidToHexString } from "@/utils/uuid"

export async function deleteCourseReview(
	req: DeleteCourseReviewRequest,
	context: HandlerContext
): Promise<DeleteCourseReviewResponse> {
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

	const courseId = existingReview.courseId

	// Delete review
	await db.delete(courseReview).where(eq(courseReview.id, reviewId))

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

	return create(DeleteCourseReviewResponseSchema, {
		success: true,
	})
}
