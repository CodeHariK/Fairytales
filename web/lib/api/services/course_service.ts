import { ConnectRouter } from "@connectrpc/connect"
import { CourseService } from "@/gen/courses/v1/courses_pb"
import { getCoursesByUserId } from "@/lib/api/course_service/getCoursesByUserId"
import { getCoursesByCreatorId } from "@/lib/api/course_service/getCoursesByCreatorId"
import { getCoursesByCategoryId } from "@/lib/api/course_service/getCoursesByCategoryId"
import { getCourseById } from "@/lib/api/course_service/getCourseById"
import { createCourse } from "@/lib/api/course_service/createCourse"
import { updateCourse } from "@/lib/api/course_service/updateCourse"
import { deleteCourse } from "@/lib/api/course_service/deleteCourse"
import { healthCheck } from "@/lib/api/course_service/healthCheck"

export default (router: ConnectRouter) => {
	router.service(CourseService, {
		getCoursesByUserId,
		getCoursesByCreatorId,
		getCoursesByCategoryId,
		getCourseById,
		createCourse,
		updateCourse,
		deleteCourse,
		healthCheck,
	})
}
