import { ConnectRouter } from "@connectrpc/connect"
import { CourseReviewService } from "@/gen/courses/v1/course_reviews_pb"
import { getCourseReviewsPaginated } from "@/lib/api/course_review_service/getCourseReviewsPaginated"
import { createCourseReview } from "@/lib/api/course_review_service/createCourseReview"
import { updateCourseReview } from "@/lib/api/course_review_service/updateCourseReview"
import { deleteCourseReview } from "@/lib/api/course_review_service/deleteCourseReview"
import { getUserReview } from "@/lib/api/course_review_service/getUserReview"

export default (router: ConnectRouter) => {
	router.service(CourseReviewService, {
		getCourseReviewsPaginated,
		createCourseReview,
		updateCourseReview,
		deleteCourseReview,
		getUserReview,
	})
}
