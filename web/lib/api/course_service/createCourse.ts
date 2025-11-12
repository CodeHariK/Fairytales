import { create } from "@bufbuild/protobuf"
import { CourseSchema, CreateCourseResponseSchema } from "@/gen/courses/v1/courses_pb"
import type { CreateCourseRequest, CreateCourseResponse } from "@/gen/courses/v1/courses_pb"
import { createUuidV7 } from "@/utils/uuid"
import { env } from "@/utils/env"
import { getMockDataStore } from "./mock-data"

export function createCourse(req: CreateCourseRequest): CreateCourseResponse {
	// Create a new course with the provided data
	const newCourse = create(CourseSchema, {
		id: createUuidV7(),
		title: req.title,
		category: req.category,
		level: req.level,
		lessons: req.lessons,
		hours: req.hours,
		students: 0, // New courses start with 0 students
		price: req.price,
		image: req.image,
		status: req.status,
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
