import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { DeleteCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { DeleteCourseRequest, DeleteCourseResponse } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"

export function deleteCourse(
	req: DeleteCourseRequest,
	context: HandlerContext
): DeleteCourseResponse {
	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		const success = store.deleteCourse(req.id)

		if (!success) {
			throw new ConnectError(`Course with ID not found`, Code.NotFound)
		}

		return create(DeleteCourseResponseSchema, {
			success: true,
		})
	}

	// TODO: Implement database delete when DEBUG_DATA is false
	// Example:
	// const result = await db.delete(courses)
	//   .where(eq(courses.id, req.id));
	// if (result.rowCount === 0) {
	//   throw new ConnectError("Course not found", Code.NotFound);
	// }

	throw new Error("Database deletes not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
