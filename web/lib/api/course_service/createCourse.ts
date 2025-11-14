import { create } from "@bufbuild/protobuf"
import { CourseSchema, CreateCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { CreateCourseRequest, CreateCourseResponse } from "@/gen/courses/v1/courses_pb"
import { createUuidV7 } from "@/utils/uuid"
import { env } from "@/utils/env"
import { getMockDataStore } from "../mock/mock-data"

export function createCourse(req: CreateCourseRequest): CreateCourseResponse {
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

	if (env.DEBUG_DATA) {
		// Store in mock data store when DEBUG_DATA is enabled
		const store = getMockDataStore()
		const savedCourse = store.addCourse(newCourse)

		return create(CreateCourseResponseSchema, {
			course: savedCourse,
		})
	}

	// TODO: Implement database insert when DEBUG_DATA is false
	// Example:
	// const [savedCourse] = await db.insert(courses).values({
	//   id: newCourse.id,
	//   title: newCourse.title,
	//   ...
	// }).returning();

	throw new Error("Database insert not implemented yet. Set DEBUG_DATA=true to use mock data.")
}
