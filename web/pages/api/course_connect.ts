import { ConnectRouter } from "@connectrpc/connect"
import { create } from "@bufbuild/protobuf"
import {
	CourseService,
	CourseSchema,
	GetUserCoursesResponseSchema,
} from "@/gen/courses/v1/courses_pb"
import type {
	GetUserCoursesRequest,
	GetUserCoursesResponse,
} from "@/gen/courses/v1/courses_pb"
import { CourseLevel, CourseStatus } from "@/gen/courses/v1/courses_pb"
import { createUuidV7 } from "@/utils/uuid"

export default (router: ConnectRouter) => {
	router.service(CourseService, {
		getUserCourses(req: GetUserCoursesRequest): GetUserCoursesResponse {
			const allCourses = [
				create(CourseSchema, {
					id: createUuidV7(),
					title: "Graphic Design Fundamentals",
					category: "Web Development",
					level: CourseLevel.BEGINNER,
					lessons: 20,
					hours: 40,
					students: 317,
					price: 99,
					image: "https://img.freepik.com/free-photo/beautiful-house-with-nature-elements_23-2151848749.jpg",
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
					image: "https://img.freepik.com/free-vector/hand-drawn-science-education-background_23-2148499325.jpg",
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
					image: "https://img.freepik.com/free-vector/flat-woman-taking-care-plants-indoors_23-2148983751.jpg",
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
					image: "https://img.freepik.com/free-photo/anime-style-character-with-water_23-2151080214.jpg",
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
					image: "https://img.freepik.com/free-vector/flat-background-autumn-season-celebration_23-2150696152.jpg",
					status: CourseStatus.ARCHIVED,
				}),
			]

			// Filter by status if provided
			let filteredCourses = allCourses
			if (req.statusFilter && req.statusFilter !== "all") {
				const statusMap: Record<string, CourseStatus> = {
					active: CourseStatus.ACTIVE,
					draft: CourseStatus.DRAFT,
					archived: CourseStatus.ARCHIVED,
				}
				const status = statusMap[req.statusFilter]
				if (status) {
					filteredCourses = allCourses.filter((course) => course.status === status)
				}
			}

			return create(GetUserCoursesResponseSchema, {
				courses: filteredCourses,
				total: filteredCourses.length,
			})
		},
	})
}
