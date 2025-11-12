import { create } from "@bufbuild/protobuf"
import { CourseSchema } from "@/gen/courses/v1/courses_pb"
import { CourseLevel, CourseStatus } from "@/gen/courses/v1/courses_pb"
import { createUuidV7 } from "@/utils/uuid"
import type { Course } from "@/gen/courses/v1/courses_pb"

/**
 * In-memory mock data store for testing UI without database
 * Only used when DEBUG_DATA=true
 */
class MockDataStore {
	private courses: Course[] = []

	constructor() {
		// Initialize with sample data
		this.courses = [
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Graphic Design Fundamentals",
				category: "Web Development",
				level: CourseLevel.BEGINNER,
				lessons: 20,
				hours: 40,
				students: 317,
				price: 99,
				image:
					"https://img.freepik.com/free-photo/beautiful-house-with-nature-elements_23-2151848749.jpg",
				status: CourseStatus.ACTIVE,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Digital Marketing Mastery",
				category: "Marketing",
				level: CourseLevel.INTERMEDIATE,
				lessons: 18,
				hours: 30,
				students: 277,
				price: 79,
				image:
					"https://img.freepik.com/free-vector/hand-drawn-science-education-background_23-2148499325.jpg",
				status: CourseStatus.ACTIVE,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Business Analytics with Excel",
				category: "Business",
				level: CourseLevel.INTERMEDIATE,
				lessons: 22,
				hours: 45,
				students: 300,
				price: 95,
				image:
					"https://img.freepik.com/free-vector/flat-woman-taking-care-plants-indoors_23-2148983751.jpg",
				status: CourseStatus.DRAFT,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Python for Beginners",
				category: "Web Development",
				level: CourseLevel.BEGINNER,
				lessons: 25,
				hours: 50,
				students: 342,
				price: 89,
				image: "https://img.freepik.com/free-vector/flat-adventure-background_23-2149031058.jpg",
				status: CourseStatus.ACTIVE,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "UI/UX Design Basics",
				category: "Web Development",
				level: CourseLevel.BEGINNER,
				lessons: 20,
				hours: 35,
				students: 290,
				price: 89,
				image:
					"https://img.freepik.com/free-photo/anime-style-character-with-water_23-2151080214.jpg",
				status: CourseStatus.ACTIVE,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Social Media Strategies",
				category: "Marketing",
				level: CourseLevel.ADVANCED,
				lessons: 24,
				hours: 40,
				students: 254,
				price: 109,
				image:
					"https://img.freepik.com/free-vector/flat-background-autumn-season-celebration_23-2150696152.jpg",
				status: CourseStatus.ARCHIVED,
			}),
		]
	}

	getAllCourses(): Course[] {
		return [...this.courses]
	}

	addCourse(course: Course): Course {
		this.courses.push(course)
		return course
	}

	findCourseById(id: Uint8Array): Course | undefined {
		return this.courses.find(
			(course) =>
				course.id.length === id.length && course.id.every((byte, index) => byte === id[index])
		)
	}

	updateCourse(id: Uint8Array, updates: Partial<Course>): Course | undefined {
		const index = this.courses.findIndex(
			(course) => course.id.length === id.length && course.id.every((byte, i) => byte === id[i])
		)
		if (index === -1) return undefined

		const updated = create(CourseSchema, {
			...this.courses[index],
			...updates,
			id: this.courses[index].id, // Preserve original ID
		})
		this.courses[index] = updated
		return updated
	}

	deleteCourse(id: Uint8Array): boolean {
		const index = this.courses.findIndex(
			(course) => course.id.length === id.length && course.id.every((byte, i) => byte === id[i])
		)
		if (index === -1) return false

		this.courses.splice(index, 1)
		return true
	}
}

// Singleton instance
let mockStore: MockDataStore | null = null

export function getMockDataStore(): MockDataStore {
	if (!mockStore) {
		mockStore = new MockDataStore()
	}
	return mockStore
}
