import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { UpdateCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { UpdateCourseRequest, UpdateCourseResponse, Course } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database update
// Example:
// const [updatedCourse] = await db.update(courses)
//   .set(updates)
//   .where(eq(courses.id, req.id))
//   .returning();
// if (!updatedCourse) {
//   throw new ConnectError("Course not found", Code.NotFound);
// }

export function updateCourse(
	req: UpdateCourseRequest,
	context: HandlerContext
): UpdateCourseResponse {
	throw new ConnectError("Database updates not implemented yet", Code.Unimplemented)
}
