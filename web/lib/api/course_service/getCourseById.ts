import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetCourseByIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { GetCourseByIdRequest, GetCourseByIdResponse } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database query
// Example:
// const course = await db.query.courses.findFirst({
//   where: eq(courses.id, req.id),
// });
// if (!course) {
//   throw new ConnectError("Course not found", Code.NotFound);
// }

export function getCourseById(
	req: GetCourseByIdRequest,
	context: HandlerContext
): GetCourseByIdResponse {
	throw new ConnectError("Database queries not implemented yet", Code.Unimplemented)
}
