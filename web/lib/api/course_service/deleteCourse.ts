import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { DeleteCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { DeleteCourseRequest, DeleteCourseResponse } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database delete
// Example:
// const result = await db.delete(courses)
//   .where(eq(courses.id, req.id));
// if (result.rowCount === 0) {
//   throw new ConnectError("Course not found", Code.NotFound);
// }

export function deleteCourse(
	req: DeleteCourseRequest,
	context: HandlerContext
): DeleteCourseResponse {
	throw new ConnectError("Database deletes not implemented yet", Code.Unimplemented)
}
