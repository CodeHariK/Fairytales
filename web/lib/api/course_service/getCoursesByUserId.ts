import { HandlerContext } from "@connectrpc/connect"
import { create } from "@bufbuild/protobuf"
import { GetCoursesByUserIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByUserIdRequest,
	GetCoursesByUserIdResponse,
} from "@/gen/courses/v1/courses_pb"
import { kSession } from "@/utils/session-context"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database query
// Example:
// const courses = await db.query.courses.findMany({
//   where: eq(courses.userId, req.userId),
//   ...
// });

export function getCoursesByUserId(
	req: GetCoursesByUserIdRequest,
	context: HandlerContext
): GetCoursesByUserIdResponse {
	const session = context.values.get(kSession)

	// console.log("session", session)
	// console.log("req", req)

	throw new ConnectError("Database queries not implemented yet", Code.Unimplemented)
}
