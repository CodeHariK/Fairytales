import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { UpdateCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { UpdateCourseRequest, UpdateCourseResponse, Course } from "@/gen/courses/v1/courses_pb"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { course } from "@/schema/schema"
import { eq } from "drizzle-orm"
import { uuidToHexString } from "@/utils/uuid"

// TODO: Implement database update
// Example:
// const [updatedCourse] = await db.update(courses)
//   .set(updates)
//   .where(eq(courses.id, req.id))
//   .returning();
// if (!updatedCourse) {
//   throw new ConnectError("Course not found", Code.NotFound);
// }

export async function updateCourse(
	req: UpdateCourseRequest,
	context: HandlerContext
): Promise<UpdateCourseResponse> {
	// Require authentication
	const session = await requireAuth(context)

	const courseId = uuidToHexString(req.id)

	// Get the course to verify it exists and check creator
	const courseData = await db.query.course.findFirst({
		where: eq(course.id, courseId),
	})

	if (!courseData) {
		throw new ConnectError("Course not found", Code.NotFound)
	}

	// Verify user is the creator of this course
	if (courseData.creatorId !== session.user.id) {
		throw new ConnectError("Only the course creator can update this course", Code.PermissionDenied)
	}

	throw new ConnectError("Database updates not implemented yet", Code.Unimplemented)
}
