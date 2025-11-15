import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetCoursesByCategoryIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByCategoryIdRequest,
	GetCoursesByCategoryIdResponse,
} from "@/gen/courses/v1/courses_pb"
import { kSession } from "@/utils/session-context"
import { CourseStatus } from "@/gen/courses/v1/courses_pb"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"

export function getCoursesByCategoryId(
	req: GetCoursesByCategoryIdRequest,
	context: HandlerContext
): GetCoursesByCategoryIdResponse {
	const session = context.values.get(kSession)

	// console.log("session", session)
	// console.log("req", req)

	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		let allCourses = store.getAllCourses()

		// Filter by category_id (check if category_id is in the course's categoryIds array)
		allCourses = allCourses.filter((course) => {
			if (req.categoryId === undefined || !course.categoryIds || course.categoryIds.length === 0) {
				return false
			}
			// Check if the requested category_id exists in the course's categoryIds array
			return course.categoryIds.includes(req.categoryId)
		})

		// Filter by status if provided and not UNSPECIFIED
		if (req.statusFilter !== undefined && req.statusFilter !== CourseStatus.UNSPECIFIED) {
			allCourses = allCourses.filter((course) => course.status === req.statusFilter)
		}

		// Calculate pagination
		const total = allCourses.length
		const page = req.page || 1
		const pageSize = req.pageSize || 10
		const totalPages = Math.ceil(total / pageSize)
		const startIndex = (page - 1) * pageSize
		const endIndex = startIndex + pageSize
		const paginatedCourses = allCourses.slice(startIndex, endIndex)

		return create(GetCoursesByCategoryIdResponseSchema, {
			courses: paginatedCourses,
			total,
			page,
			pageSize,
			totalPages,
		})
	}

	// TODO: Implement database query when DEBUG_DATA is false
	// Example:
	// const courses = await db.query.courses.findMany({
	//   where: arrayContains(courses.categoryIds, req.categoryId),
	//   ...
	// });

	throw new Error("Database queries not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
