import { create } from "@bufbuild/protobuf"
import { CourseSchema, LessonSchema } from "@/gen/courses/v1/courses_pb"
import { CourseLevel, CourseStatus } from "@/gen/courses/v1/courses_pb"
import { createUuidV7 } from "@/utils/uuid"
import type { Course, Lesson } from "@/gen/courses/v1/courses_pb"

/**
 * Helper function to create mock lessons
 */
function createMockLessons(count: number): Lesson[] {
	return Array.from({ length: count }, (_, i) =>
		create(LessonSchema, {
			title: `Lesson ${i + 1}`,
			duration: 30 + i * 5, // 30-35 minutes per lesson
		})
	)
}

/**
 * In-memory mock data store for testing UI without database
 * Only used when DEBUG_DATA=true
 */
class MockDataStore {
	private courses: Course[] = []
	private mockCreatorId = createUuidV7()

	constructor() {
		// Initialize with sample data
		this.courses = [
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Graphic Design Fundamentals",
				description: "Learn the fundamentals of graphic design",
				categoryIds: [createUuidV7()],
				level: CourseLevel.BEGINNER,
				lessons: createMockLessons(20),
				price: 99,
				image:
					"https://img.freepik.com/free-photo/beautiful-house-with-nature-elements_23-2151848749.jpg",
				status: CourseStatus.ACTIVE,
				creatorId: this.mockCreatorId,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Digital Marketing Mastery",
				description: "Master digital marketing strategies",
				categoryIds: [createUuidV7()],
				level: CourseLevel.INTERMEDIATE,
				lessons: createMockLessons(18),
				price: 79,
				image:
					"https://img.freepik.com/free-vector/hand-drawn-science-education-background_23-2148499325.jpg",
				status: CourseStatus.ACTIVE,
				creatorId: this.mockCreatorId,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Business Analytics with Excel",
				description: "Learn business analytics using Excel",
				categoryIds: [createUuidV7()],
				level: CourseLevel.INTERMEDIATE,
				lessons: createMockLessons(22),
				price: 95,
				image:
					"https://img.freepik.com/free-vector/flat-woman-taking-care-plants-indoors_23-2148983751.jpg",
				status: CourseStatus.DRAFT,
				creatorId: this.mockCreatorId,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Python for Beginners",
				description: "Start your Python programming journey",
				categoryIds: [createUuidV7()],
				level: CourseLevel.BEGINNER,
				lessons: createMockLessons(25),
				price: 89,
				image: "https://img.freepik.com/free-vector/flat-adventure-background_23-2149031058.jpg",
				status: CourseStatus.ACTIVE,
				creatorId: this.mockCreatorId,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "UI/UX Design Basics",
				description: "Learn the basics of UI/UX design",
				categoryIds: [createUuidV7()],
				level: CourseLevel.BEGINNER,
				lessons: createMockLessons(20),
				price: 89,
				image:
					"https://img.freepik.com/free-photo/anime-style-character-with-water_23-2151080214.jpg",
				status: CourseStatus.ACTIVE,
				creatorId: this.mockCreatorId,
			}),
			create(CourseSchema, {
				id: createUuidV7(),
				title: "Social Media Strategies",
				description: "Advanced social media marketing strategies",
				categoryIds: [createUuidV7()],
				level: CourseLevel.ADVANCED,
				lessons: createMockLessons(24),
				price: 109,
				image:
					"https://img.freepik.com/free-vector/flat-background-autumn-season-celebration_23-2150696152.jpg",
				status: CourseStatus.ARCHIVED,
				creatorId: this.mockCreatorId,
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
