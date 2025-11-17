import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import {
	GetCoursesByCreatorIdResponseSchema,
	CourseSchema,
	LessonSchema,
} from "@/gen/courses/v1/courses_pb"
import type {
	GetCoursesByCreatorIdRequest,
	GetCoursesByCreatorIdResponse,
	Course,
	Lesson,
} from "@/gen/courses/v1/courses_pb"
import { kSession } from "@/utils/session-context"
import { CourseStatus, CourseLevel } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { course } from "@/schema/schema"
import { and, eq, desc } from "drizzle-orm"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function getCoursesByCreatorId(
	req: GetCoursesByCreatorIdRequest,
	context: HandlerContext
): Promise<GetCoursesByCreatorIdResponse> {
	const session = context.values.get(kSession)

	if (!session?.user) {
		throw new ConnectError("Unauthorized", Code.Unauthenticated)
	}

	// Convert creatorId from bytes to hex string
	const creatorId = req.creatorId ? uuidToHexString(req.creatorId) : session.user.id

	// Build where clause
	const whereConditions = [eq(course.creatorId, creatorId)]

	// Add status filter if provided and not UNSPECIFIED
	if (req.statusFilter !== undefined && req.statusFilter !== CourseStatus.UNSPECIFIED) {
		// Map proto CourseStatus enum to database integer
		const statusMap: Record<number, number> = {
			1: 1, // ACTIVE
			2: 2, // DRAFT
			3: 3, // ARCHIVED
		}
		const statusInt = statusMap[req.statusFilter]
		if (statusInt !== undefined) {
			whereConditions.push(eq(course.status, statusInt))
		}
	}

	// Get courses from database
	const coursesData = await db.query.course.findMany({
		where: and(...whereConditions),
		orderBy: (course, { desc }) => [desc(course.createdAt)],
		with: {
			categoryRelations: {
				with: {
					category: true,
				},
			},
			lessons: {
				orderBy: (lesson, { asc }) => [asc(lesson.order)],
			},
		},
	})

	// Pagination
	const page = req.page || 1
	const pageSize = req.pageSize || 10
	const total = coursesData.length
	const totalPages = Math.ceil(total / pageSize)
	const startIndex = (page - 1) * pageSize
	const endIndex = startIndex + pageSize
	const paginatedCourses = coursesData.slice(startIndex, endIndex)

	// Map database courses to proto Course messages
	const courses: Course[] = paginatedCourses.map((courseData) => {
		// Get category IDs from relations
		const categoryIds = courseData.categoryRelations?.map((rel) => rel.categoryId) || []

		// Map lessons to proto Lesson messages
		const lessons: Lesson[] =
			courseData.lessons?.map((lessonData) =>
				create(LessonSchema, {
					title: lessonData.title,
					duration: lessonData.duration,
					videoLink: undefined,
					codeMd: undefined,
				})
			) || []

		// Map database level integer to proto CourseLevel enum
		const levelMap: Record<number, CourseLevel> = {
			0: CourseLevel.UNSPECIFIED,
			1: CourseLevel.BEGINNER,
			2: CourseLevel.INTERMEDIATE,
			3: CourseLevel.ADVANCED,
		}

		// Map database status integer to proto CourseStatus enum
		const statusMap: Record<number, CourseStatus> = {
			0: CourseStatus.UNSPECIFIED,
			1: CourseStatus.ACTIVE,
			2: CourseStatus.DRAFT,
			3: CourseStatus.ARCHIVED,
		}

		return create(CourseSchema, {
			id: hexStringToUuid(courseData.id),
			title: courseData.title,
			description: courseData.description || "",
			categoryIds,
			level: levelMap[courseData.level] ?? CourseLevel.UNSPECIFIED,
			lessons,
			price: courseData.price,
			image: courseData.image || "",
			status: statusMap[courseData.status] ?? CourseStatus.UNSPECIFIED,
			creatorId: hexStringToUuid(courseData.creatorId),
		})
	})

	return create(GetCoursesByCreatorIdResponseSchema, {
		courses,
		total,
		page,
		pageSize,
		totalPages,
	})
}
