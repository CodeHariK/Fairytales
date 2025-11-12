import { ConnectRouter } from "@connectrpc/connect"
import { CourseService } from "@/gen/courses/v1/courses_pb"
import { getUserCourses } from "@/lib/api/course_service/getUserCourses"
import { createCourse } from "@/lib/api/course_service/createCourse"

export default (router: ConnectRouter) => {
	router.service(CourseService, {
		getUserCourses,
		createCourse,
	})
}
