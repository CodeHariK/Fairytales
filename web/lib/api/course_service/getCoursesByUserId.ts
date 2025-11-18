import { HandlerContext } from "@connectrpc/connect"
import { create } from "@bufbuild/protobuf"
import { GetCoursesByUserIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByUserIdRequest,
	GetCoursesByUserIdResponse,
} from "@/gen/courses/v1/courses_pb"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database query
// Example:
// const courses = await db.query.courses.findMany({
//   where: eq(courses.userId, req.userId),
//   ...
// });

export async function getCoursesByUserId(
	req: GetCoursesByUserIdRequest,
	context: HandlerContext
): Promise<GetCoursesByUserIdResponse> {
	// Require authentication
	await requireAuth(context)

	throw new ConnectError("Database queries not implemented yet", Code.Unimplemented)
}
