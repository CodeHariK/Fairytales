import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth-schema"

// CourseCategory represents a course category
export const courseCategory = pgTable("course_category", {
	id: text("id").primaryKey(),
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
}))
