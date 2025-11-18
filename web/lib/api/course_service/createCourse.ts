import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { CourseSchema, CreateCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { CreateCourseRequest, CreateCourseResponse } from "@/gen/courses/v1/courses_pb"
import { createUuidV7 } from "@/utils/uuid"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { ConnectError, Code } from "@connectrpc/connect"

// TODO: Implement database insert
// Example:
// const [savedCourse] = await db.insert(courses).values({
//   id: newCourse.id,
//   title: newCourse.title,
//   ...
// }).returning();

export async function createCourse(
	req: CreateCourseRequest,
	context: HandlerContext
): Promise<CreateCourseResponse> {
	// Require authentication
	await requireAuth(context)
	// Create a new course with the provided data
	// Optional fields can be omitted, defaults will be used
	const newCourse = create(CourseSchema, {
		id: createUuidV7(),
		title: req.title,
		description: req.description ?? "",
		categoryIds: req.categoryIds ?? [],
		level: req.level ?? 0, // COURSE_LEVEL_UNSPECIFIED
		lessons: req.lessons ?? [],
		price: req.price ?? 0,
		image: req.image ?? "",
		status: req.status ?? 2, // COURSE_STATUS_DRAFT
		creatorId: req.creatorId,
	})

	throw new ConnectError("Database insert not implemented yet", Code.Unimplemented)
}
