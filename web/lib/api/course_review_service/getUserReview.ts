import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetUserReviewResponseSchema, CourseReviewSchema } from "@/gen/courses/v1/course_reviews_pb"
import type {
	GetUserReviewRequest,
	GetUserReviewResponse,
} from "@/gen/courses/v1/course_reviews_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { courseReview } from "@/schema/schema"
import { and, eq } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function getUserReview(
	req: GetUserReviewRequest,
	context: HandlerContext
): Promise<GetUserReviewResponse> {
	// Require authentication
	const session = await requireAuth(context)

	// Always use the authenticated user from session for security
	const userId = session.user.id
	const courseId = uuidToHexString(req.courseId)

	// Get user's review for this course
	const reviewData = await db.query.courseReview.findFirst({
		where: (review, { and, eq }) => and(eq(review.userId, userId), eq(review.courseId, courseId)),
	})

	if (!reviewData) {
		// User hasn't reviewed this course
		return create(GetUserReviewResponseSchema, {
			review: undefined,
		})
	}

	// Create review proto message
	const reviewProto = create(CourseReviewSchema, {
		id: hexStringToUuid(reviewData.id),
		courseId: hexStringToUuid(reviewData.courseId),
		userId: hexStringToUuid(reviewData.userId),
		rating: reviewData.rating,
		comment: reviewData.comment || "",
		createdAt: BigInt(Math.floor(reviewData.createdAt.getTime() / 1000)),
		updatedAt: BigInt(Math.floor(reviewData.updatedAt.getTime() / 1000)),
	})

	return create(GetUserReviewResponseSchema, {
		review: reviewProto,
	})
}
