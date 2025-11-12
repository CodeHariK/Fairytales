import { create } from "@bufbuild/protobuf"
import { GetUserCoursesResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { GetUserCoursesRequest, GetUserCoursesResponse } from "@/gen/courses/v1/courses_pb"
import { CourseStatus } from "@/gen/courses/v1/courses_pb"
import { env } from "@/utils/env"
import { getMockDataStore } from "./mock-data"

export function getUserCourses(req: GetUserCoursesRequest): GetUserCoursesResponse {
	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		let allCourses = store.getAllCourses()

		// Filter by status if provided
		if (req.statusFilter && req.statusFilter !== "all") {
			const statusMap: Record<string, CourseStatus> = {
				active: CourseStatus.ACTIVE,
				draft: CourseStatus.DRAFT,
				archived: CourseStatus.ARCHIVED,
			}
			const status = statusMap[req.statusFilter]
			if (status) {
				allCourses = allCourses.filter((course) => course.status === status)
			}
		}

		return create(GetUserCoursesResponseSchema, {
			courses: allCourses,
			total: allCourses.length,
		})
	}

	// TODO: Implement database query when DEBUG_DATA is false
	// Example:
	// const courses = await db.query.courses.findMany({
	//   where: eq(courses.userId, session.user.id),
	//   ...
	// });

	throw new Error("Database queries not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
