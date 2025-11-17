"use server"

import { db } from "@/utils/pg"
import { course } from "@/schema/schema"
import { eq, inArray } from "drizzle-orm"

export async function getCoursesByIds(courseIds: string[]) {
	if (courseIds.length === 0) return []

	const courses = await db.query.course.findMany({
		where: inArray(course.id, courseIds),
	})

	return courses
}
