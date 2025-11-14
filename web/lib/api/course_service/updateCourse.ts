import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { UpdateCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { UpdateCourseRequest, UpdateCourseResponse, Course } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"

export function updateCourse(
	req: UpdateCourseRequest,
	context: HandlerContext
): UpdateCourseResponse {
	if (env.DEBUG_DATA) {
		// Use mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()

		// Build update object with only provided fields
		const updates: Partial<Course> = {}
		if (req.title !== undefined) updates.title = req.title
		if (req.description !== undefined) updates.description = req.description
		if (req.categoryIds !== undefined) updates.categoryIds = req.categoryIds
		if (req.level !== undefined) updates.level = req.level
		if (req.lessons !== undefined) updates.lessons = req.lessons
		if (req.price !== undefined) updates.price = req.price
		if (req.image !== undefined) updates.image = req.image
		if (req.status !== undefined) updates.status = req.status

		const updatedCourse = store.updateCourse(req.id, updates)

		if (!updatedCourse) {
			throw new ConnectError(`Course with ID not found`, Code.NotFound)
		}

		return create(UpdateCourseResponseSchema, {
			course: updatedCourse,
		})
	}

	// TODO: Implement database update when DEBUG_DATA is false
	// Example:
	// const [updatedCourse] = await db.update(courses)
	//   .set(updates)
	//   .where(eq(courses.id, req.id))
	//   .returning();
	// if (!updatedCourse) {
	//   throw new ConnectError("Course not found", Code.NotFound);
	// }

	throw new Error("Database updates not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
