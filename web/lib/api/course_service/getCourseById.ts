import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetCourseByIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { GetCourseByIdRequest, GetCourseByIdResponse } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"

export function getCourseById(
	req: GetCourseByIdRequest,
	context: HandlerContext
): GetCourseByIdResponse {
	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		const course = store.findCourseById(req.id)

		if (!course) {
			throw new ConnectError(`Course with ID not found`, Code.NotFound)
		}

		return create(GetCourseByIdResponseSchema, {
			course,
		})
	}

	// TODO: Implement database query when DEBUG_DATA is false
	// Example:
	// const course = await db.query.courses.findFirst({
	//   where: eq(courses.id, req.id),
	// });
	// if (!course) {
	//   throw new ConnectError("Course not found", Code.NotFound);
	// }

	throw new Error("Database queries not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
