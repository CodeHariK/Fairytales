import { pgTable, text, timestamp, integer, real, unique } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth-schema"

// CourseCategory represents a course category
export const courseCategory = pgTable("course_category", {
	id: text("id").primaryKey(), // Unique string (e.g., "design", "technology")
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
})

// Course represents a course entity
export const course = pgTable("course", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	level: integer("level").notNull().default(0), // 0=UNSPECIFIED, 1=BEGINNER, 2=INTERMEDIATE, 3=ADVANCED
	price: integer("price").notNull().default(0),
	image: text("image"),
	status: integer("status").notNull().default(2), // 0=UNSPECIFIED, 1=ACTIVE, 2=DRAFT, 3=ARCHIVED
	creatorId: text("creator_id")
		.notNull()
		.references(() => user.id),
	averageRating: real("average_rating").notNull().default(0), // Average rating from reviews (0-5)
	totalReview: integer("total_review").notNull().default(0), // Total number of reviews
	totalCustomer: integer("total_customer").notNull().default(0), // Total number of customers (enrollments)
	duration: integer("duration").notNull().default(0), // Total duration in minutes (sum of all lesson durations)
	numLesson: integer("num_lesson").notNull().default(0), // Total number of lessons
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
})

// Junction table for many-to-many relationship between courses and categories
export const courseCategoryRelation = pgTable("course_category_relation", {
	courseId: text("course_id")
		.notNull()
		.references(() => course.id, { onDelete: "cascade" }),
	categoryId: text("category_id")
		.notNull()
		.references(() => courseCategory.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
})

// Lesson represents a lesson within a course
export const lesson = pgTable("lesson", {
	id: text("id").primaryKey(),
	courseId: text("course_id")
		.notNull()
		.references(() => course.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	duration: integer("duration").notNull(), // Duration in minutes
	order: integer("order").notNull().default(0), // Order/position within the course
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
})

// LessonContent stores large content for lessons (separate table for performance)
export const lessonContent = pgTable("lesson_content", {
	lessonId: text("lesson_id")
		.primaryKey()
		.references(() => lesson.id, { onDelete: "cascade" }),
	videoLink: text("video_link"), // Optional video URL
	codeMd: text("code_md"), // Optional markdown code content (large string)
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
})

// Enrollment represents a user's enrollment in a course
export const enrollment = pgTable("enrollment", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	courseId: text("course_id")
		.notNull()
		.references(() => course.id, { onDelete: "cascade" }),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	stripeCheckoutSessionId: text("stripe_checkout_session_id"),
	status: text("status").notNull().default("pending"), // pending, completed, failed
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
})

// CourseReview represents a review for a course
export const courseReview = pgTable("course_review", {
	id: text("id").primaryKey(),
	courseId: text("course_id")
		.notNull()
		.references(() => course.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	rating: integer("rating").notNull(), // Rating from 1 to 5
	comment: text("comment"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
})

// Unique constraint: one review per user per course
export const courseReviewUserCourseUnique = unique("course_review_user_course_unique").on(
	courseReview.userId,
	courseReview.courseId
)

// Relations
export const courseCategoryRelations = relations(courseCategory, ({ many }) => ({
	courseRelations: many(courseCategoryRelation),
}))

export const courseRelations = relations(course, ({ one, many }) => ({
	creator: one(user, {
		fields: [course.creatorId],
		references: [user.id],
	}),
	lessons: many(lesson),
	categoryRelations: many(courseCategoryRelation),
	reviews: many(courseReview),
	enrollments: many(enrollment),
}))

export const courseCategoryRelationRelations = relations(courseCategoryRelation, ({ one }) => ({
	course: one(course, {
		fields: [courseCategoryRelation.courseId],
		references: [course.id],
	}),
	category: one(courseCategory, {
		fields: [courseCategoryRelation.categoryId],
		references: [courseCategory.id],
	}),
}))

export const lessonRelations = relations(lesson, ({ one }) => ({
	course: one(course, {
		fields: [lesson.courseId],
		references: [course.id],
	}),
	content: one(lessonContent, {
		fields: [lesson.id],
		references: [lessonContent.lessonId],
	}),
}))

export const lessonContentRelations = relations(lessonContent, ({ one }) => ({
	lesson: one(lesson, {
		fields: [lessonContent.lessonId],
		references: [lesson.id],
	}),
}))

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
	user: one(user, {
		fields: [enrollment.userId],
		references: [user.id],
	}),
	course: one(course, {
		fields: [enrollment.courseId],
		references: [course.id],
	}),
}))

export const courseReviewRelations = relations(courseReview, ({ one }) => ({
	course: one(course, {
		fields: [courseReview.courseId],
		references: [course.id],
	}),
	user: one(user, {
		fields: [courseReview.userId],
		references: [user.id],
	}),
}))
