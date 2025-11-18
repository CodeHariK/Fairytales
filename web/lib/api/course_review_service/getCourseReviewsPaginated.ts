import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import {
	GetCourseReviewsPaginatedResponseSchema,
	CourseReviewSchema,
} from "@/gen/courses/v1/course_reviews_pb"
import type {
	GetCourseReviewsPaginatedRequest,
	GetCourseReviewsPaginatedResponse,
} from "@/gen/courses/v1/course_reviews_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { courseReview } from "@/schema/schema"
import { and, eq, gte } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function getCourseReviewsPaginated(
	req: GetCourseReviewsPaginatedRequest,
	context: HandlerContext
): Promise<GetCourseReviewsPaginatedResponse> {
	// Reviews are public - no authentication required
	// await requireAuth(context)

	const courseId = uuidToHexString(req.courseId)

	// Build where clause
	const whereConditions = [eq(courseReview.courseId, courseId)]

	// Add minimum rating filter if provided
	if (req.minRating !== undefined && req.minRating > 0) {
		whereConditions.push(gte(courseReview.rating, req.minRating))
	}

	// Get all reviews from database (for total count and average calculation)
	const allReviewsData = await db.query.courseReview.findMany({
		where: and(...whereConditions),
		orderBy: (review, { desc }) => [desc(review.createdAt)],
	})

	// Calculate average rating
	const total = allReviewsData.length
	const averageRating =
		total > 0 ? allReviewsData.reduce((sum, review) => sum + review.rating, 0) / total : 0

	// Pagination
	const page = req.page || 1
	const pageSize = req.pageSize || 10
	const totalPages = Math.ceil(total / pageSize)
	const startIndex = (page - 1) * pageSize
	const endIndex = startIndex + pageSize
	const paginatedReviews = allReviewsData.slice(startIndex, endIndex)

	// Map database reviews to proto CourseReview messages
	const reviews = paginatedReviews.map((reviewData) =>
		create(CourseReviewSchema, {
			id: hexStringToUuid(reviewData.id),
			courseId: hexStringToUuid(reviewData.courseId),
			userId: hexStringToUuid(reviewData.userId),
			rating: reviewData.rating,
			comment: reviewData.comment || "",
			createdAt: BigInt(Math.floor(reviewData.createdAt.getTime() / 1000)),
			updatedAt: BigInt(Math.floor(reviewData.updatedAt.getTime() / 1000)),
		})
	)

	return create(GetCourseReviewsPaginatedResponseSchema, {
		reviews,
		total,
		page,
		pageSize,
		totalPages,
		averageRating,
	})
}
