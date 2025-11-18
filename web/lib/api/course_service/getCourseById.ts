import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetCourseByIdResponseSchema, CourseSchema } from "@/gen/courses/v1/courses_pb"
import { LessonSchema } from "@/gen/courses/v1/course_lessons_pb"
import type {
	GetCourseByIdRequest,
	GetCourseByIdResponse,
	Course,
} from "@/gen/courses/v1/courses_pb"
import { CourseStatus, CourseLevel } from "@/gen/courses/v1/courses_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { course } from "@/schema/schema"
import { eq } from "drizzle-orm"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function getCourseById(
	req: GetCourseByIdRequest,
	context: HandlerContext
): Promise<GetCourseByIdResponse> {
	// Convert courseId from bytes to hex string
	const courseId = uuidToHexString(req.id)

	// Get course from database with lessons and categories
	const courseData = await db.query.course.findFirst({
		where: eq(course.id, courseId),
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

	if (!courseData) {
		throw new ConnectError("Course not found", Code.NotFound)
	}

	// Get category IDs from relations
	const categoryIds = courseData.categoryRelations?.map((rel) => rel.category.id) || []

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

	// Map lessons to proto Lesson messages
	const lessons = (courseData.lessons || []).map((lessonData) =>
		create(LessonSchema, {
			id: hexStringToUuid(lessonData.id),
			courseId: hexStringToUuid(courseData.id),
			title: lessonData.title,
			description: lessonData.description || "",
			duration: lessonData.duration,
			order: lessonData.order,
			createdAt: BigInt(Math.floor(lessonData.createdAt.getTime() / 1000)),
			updatedAt: BigInt(Math.floor(lessonData.updatedAt.getTime() / 1000)),
		})
	)

	// Create Course proto message
	const courseProto: Course = create(CourseSchema, {
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
		averageRating: courseData.averageRating,
		totalReview: courseData.totalReview,
		totalCustomer: courseData.totalCustomer,
		duration: courseData.duration || 0,
		numLesson: courseData.numLesson || 0,
	})

	return create(GetCourseByIdResponseSchema, {
		course: courseProto,
	})
}
