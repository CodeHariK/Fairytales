import { HandlerContext } from "@connectrpc/connect"
import { create } from "@bufbuild/protobuf"
import { GetCoursesByUserIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByUserIdRequest,
	GetCoursesByUserIdResponse,
} from "@/gen/courses/v1/courses_pb"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"
import { kSession } from "@/utils/session-context"

export function getCoursesByUserId(
	req: GetCoursesByUserIdRequest,
	context: HandlerContext
): GetCoursesByUserIdResponse {
	const session = context.values.get(kSession)

	// console.log("session", session)
	// console.log("req", req)

	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		const allCourses = store.getAllCourses()

		// Filter by user_id (in mock data, we'll filter by creator_id for now)
		// TODO: Add proper user_id field to Course when implementing database
		let filteredCourses = allCourses.filter((course) => {
			// Compare bytes arrays
			if (!req.userId || !course.creatorId) return false
			return (
				req.userId.length === course.creatorId.length &&
				req.userId.every((byte, i) => byte === course.creatorId[i])
			)
		})

		// Calculate pagination
		const total = filteredCourses.length
		const page = req.page || 1
		const pageSize = req.pageSize || 10
		const totalPages = Math.ceil(total / pageSize)
		const startIndex = (page - 1) * pageSize
		const endIndex = startIndex + pageSize
		const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

		return create(GetCoursesByUserIdResponseSchema, {
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
	//   where: eq(courses.userId, req.userId),
	//   ...
	// });

	throw new Error("Database queries not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
