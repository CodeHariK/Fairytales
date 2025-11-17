import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetCoursesByCategoryIdResponseSchema } from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByCategoryIdRequest,
	GetCoursesByCategoryIdResponse,
} from "@/gen/courses/v1/courses_pb"
import { kSession } from "@/utils/session-context"
import { CourseStatus } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database query
// Example:
// const courses = await db.query.courses.findMany({
//   where: arrayContains(courses.categoryIds, req.categoryId),
//   ...
// });

export function getCoursesByCategoryId(
	req: GetCoursesByCategoryIdRequest,
	context: HandlerContext
): GetCoursesByCategoryIdResponse {
	const session = context.values.get(kSession)

	// console.log("session", session)
	// console.log("req", req)

	throw new ConnectError("Database queries not implemented yet", Code.Unimplemented)
}
