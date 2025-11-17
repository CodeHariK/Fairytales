#!/usr/bin/env bun

import { db } from "../utils/pg"
import { course, user } from "../schema/schema"
import { getMockDataStore, MockDataStore } from "./mock-data"
import { uuidToHexString } from "../utils/uuid"
import { eq } from "drizzle-orm"

async function addCourses() {
	console.log("🌱 Adding mock courses from mock data...")

	// Get or create the mock creator user using MockDataStore.mockCreatorId
	const mockCreatorIdBytes = MockDataStore.mockCreatorId
	const mockCreatorId = uuidToHexString(mockCreatorIdBytes)

	// Check if mock creator user exists
	const existingCreator = await db.query.user.findFirst({
		where: eq(user.id, mockCreatorId),
		columns: {
			id: true,
		},
	})

	if (!existingCreator) {
		// Create the mock creator user
		await db.insert(user).values({
			id: mockCreatorId,
			name: "Mock Creator",
			email: "mock-creator@example.com",
		})
		console.log(`👤 Created mock creator user: ${mockCreatorId}`)
	} else {
		console.log(`📝 Using existing mock creator user: ${mockCreatorId}`)
	}

	const creatorId = mockCreatorId

	const store = getMockDataStore()
	const mockCourses = store.getAllCourses()

	// Map proto CourseLevel to database integer
	const levelMap: Record<number, number> = {
		0: 0, // UNSPECIFIED
		1: 1, // BEGINNER
		2: 2, // INTERMEDIATE
		3: 3, // ADVANCED
	}

	// Map proto CourseStatus to database integer
	const statusMap: Record<number, number> = {
		0: 0, // UNSPECIFIED
		1: 1, // ACTIVE
		2: 2, // DRAFT
		3: 3, // ARCHIVED
	}

	let created = 0
	let skipped = 0

	for (const mockCourse of mockCourses) {
		const courseId = uuidToHexString(mockCourse.id)

		// Check if course already exists
		const existing = await db.query.course.findFirst({
			where: (course, { eq }) => eq(course.id, courseId),
		})

		if (existing) {
			console.log(`⏭️  Skipping course "${mockCourse.title}" (already exists)`)
			skipped++
			continue
		}

		// Insert course (use real creator ID instead of mock)
		await db.insert(course).values({
			id: courseId,
			title: mockCourse.title,
			description: mockCourse.description || null,
			level: levelMap[mockCourse.level] ?? 0,
			price: mockCourse.price ?? 0,
			image: mockCourse.image || null,
			status: statusMap[mockCourse.status] ?? 2,
			creatorId: creatorId, // Use real user ID instead of mock
		})

		console.log(`✅ Created course: "${mockCourse.title}" (${courseId})`)
		created++
	}

	console.log(`   Created: ${created} courses`)
	console.log(`   Skipped: ${skipped} courses (already exist)`)
}

addCourses()
	.then(() => {
		console.log("🎉 Done!")
		process.exit(0)
	})
	.catch((error) => {
		console.error("❌ Error adding mock courses:", error)
		process.exit(1)
	})
