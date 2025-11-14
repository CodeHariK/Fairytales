import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetCoursesByCreatorIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByCreatorIdRequest,
	GetCoursesByCreatorIdResponse,
} from "@/gen/courses/v1/courses_pb"
import { kSession } from "@/utils/session-context"
import { CourseStatus } from "@/gen/courses/v1/courses_pb"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"

export function getCoursesByCreatorId(
	req: GetCoursesByCreatorIdRequest,
	context: HandlerContext
): GetCoursesByCreatorIdResponse {
	const session = context.values.get(kSession)

	// console.log("session", session)
	// console.log("req", req)

	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		let allCourses = store.getAllCourses()

		// Filter by creator_id
		allCourses = allCourses.filter((course) => {
			if (!req.creatorId || !course.creatorId) return false
			// Compare bytes arrays
			return (
				req.creatorId.length === course.creatorId.length &&
				req.creatorId.every((byte, i) => byte === course.creatorId[i])
			)
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

		return create(GetCoursesByCreatorIdResponseSchema, {
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
	//   where: eq(courses.creatorId, req.creatorId),
	//   ...
	// });

	throw new Error("Database queries not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
