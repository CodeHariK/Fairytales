import { HandlerContext } from "@connectrpc/connect"
import type {
	GetCoursesByCategoryIdRequest,
	GetCoursesByCategoryIdResponse,
} from "@/gen/courses/v1/courses_pb"
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
	throw new ConnectError("Database queries not implemented yet", Code.Unimplemented)
}
