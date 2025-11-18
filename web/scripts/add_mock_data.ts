#!/usr/bin/env bun

import { db } from "../utils/pg"
import {
	course,
	courseCategory,
	courseCategoryRelation,
	courseReview,
	enrollment,
	user,
} from "../schema/schema"
import { getMockDataStore, MockDataStore } from "./mock-data"
import { uuidToHexString, createUuidV7 } from "../utils/uuid"
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

	// Create mock categories
	console.log("📂 Creating mock categories...")
	const categories = [
		{
			id: MockDataStore.mockCategoryId1, // "design"
			name: "Design",
			description: "Graphic design, UI/UX, and visual arts courses",
		},
		{
			id: MockDataStore.mockCategoryId2, // "technology"
			name: "Technology",
			description: "Programming, software development, and tech skills",
		},
	]

	const categoryIdMap = new Map<string, string>()

	for (const category of categories) {
		// Check if category already exists by id (slug)
		const existing = await db.query.courseCategory.findFirst({
			where: (cat, { eq }) => eq(cat.id, category.id),
		})

		if (existing) {
			categoryIdMap.set(category.id, existing.id)
			console.log(`📝 Using existing category: "${category.name}" (slug: ${existing.id})`)
		} else {
			// Insert category with slug as id
			const result = await db
				.insert(courseCategory)
				.values({
					id: category.id, // Use slug as primary key
					name: category.name,
					description: category.description,
				})
				.returning()

			const newCategoryId = result[0]?.id
			if (newCategoryId) {
				categoryIdMap.set(category.id, newCategoryId)
				console.log(`✅ Created category: "${category.name}" (slug: ${newCategoryId})`)
			}
		}
	}

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
	let relationsCreated = 0

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

		// Calculate duration and numLesson from lessons
		const lessons = Array.isArray(mockCourse.lessons) ? mockCourse.lessons : []
		const duration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)
		const numLesson = lessons.length

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
			duration,
			numLesson,
		})

		console.log(`✅ Created course: "${mockCourse.title}" (${courseId})`)
		created++

		// Create category relations for this course
		if (mockCourse.categoryIds && mockCourse.categoryIds.length > 0) {
			for (const mockCategoryId of mockCourse.categoryIds) {
				const dbCategoryId = categoryIdMap.get(mockCategoryId)
				if (dbCategoryId) {
					// Check if relation already exists
					const existingRelation = await db.query.courseCategoryRelation.findFirst({
						where: (rel, { and, eq }) =>
							and(eq(rel.courseId, courseId), eq(rel.categoryId, dbCategoryId)),
					})

					if (!existingRelation) {
						await db.insert(courseCategoryRelation).values({
							courseId,
							categoryId: dbCategoryId,
						})
						relationsCreated++
					}
				}
			}
		}
	}

	console.log(`   Created: ${created} courses`)
	console.log(`   Skipped: ${skipped} courses (already exist)`)
	console.log(`   Created: ${relationsCreated} category relations`)
}

async function addReviews() {
	console.log("⭐ Adding mock reviews...")

	// Get all courses from database
	const allCourses = await db.query.course.findMany({
		columns: {
			id: true,
			title: true,
		},
	})

	if (allCourses.length === 0) {
		console.log("⏭️  No courses found, skipping reviews")
		return
	}

	// Create mock users for reviews (if they don't exist)
	const mockUserIds: string[] = []
	const mockUserNames = ["Stella", "Luna", "Albina", "Magic", "Krystll", "Avery", "Feli"]

	for (let i = 0; i < mockUserNames.length; i++) {
		const userIdBytes = createUuidV7()
		const userId = uuidToHexString(userIdBytes)

		// Check if user exists
		const existing = await db.query.user.findFirst({
			where: eq(user.id, userId),
			columns: { id: true },
		})

		if (!existing) {
			await db.insert(user).values({
				id: userId,
				name: mockUserNames[i],
				email: `reviewer-${i + 1}@example.com`,
			})
			console.log(`👤 Created mock reviewer: ${mockUserNames[i]}`)
		} else {
			console.log(`📝 Using existing reviewer: ${mockUserNames[i]}`)
		}

		mockUserIds.push(userId)
	}

	// Sample review comments
	const reviewComments = [
		"Great course! Very comprehensive and well-structured.",
		"Excellent content and clear explanations. Highly recommend!",
		"Good course, but could use more examples.",
		"Amazing instructor and practical exercises.",
		"Solid foundation course. Perfect for beginners.",
		"Very detailed and thorough. Worth every penny!",
		"Good course overall, though some sections could be clearer.",
		"Fantastic learning experience. Learned a lot!",
		"Decent course, but needs more hands-on practice.",
		"Outstanding course! Exceeded my expectations.",
	]

	let reviewsCreated = 0
	let reviewsSkipped = 0

	// Add 2-4 reviews per course
	for (const courseData of allCourses) {
		const courseId = courseData.id
		const numReviews = Math.floor(Math.random() * 3) + 2 // 2-4 reviews

		// Shuffle user IDs to get random reviewers
		const shuffledUsers = [...mockUserIds].sort(() => Math.random() - 0.5)

		for (let i = 0; i < numReviews && i < shuffledUsers.length; i++) {
			const reviewerId = shuffledUsers[i]
			const rating = Math.floor(Math.random() * 3) + 3 // 3-5 stars
			const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)]

			// Check if review already exists
			const existingReview = await db.query.courseReview.findFirst({
				where: (review, { and, eq }) =>
					and(eq(review.courseId, courseId), eq(review.userId, reviewerId)),
			})

			if (existingReview) {
				reviewsSkipped++
				continue
			}

			// Create review
			const reviewId = uuidToHexString(createUuidV7())
			await db.insert(courseReview).values({
				id: reviewId,
				courseId,
				userId: reviewerId,
				rating,
				comment,
			})

			reviewsCreated++
		}
	}

	// Update course statistics (average_rating, total_review, total_customer)
	console.log("📊 Updating course statistics...")
	for (const courseData of allCourses) {
		const courseId = courseData.id

		// Get all reviews for this course
		const reviews = await db.query.courseReview.findMany({
			where: eq(courseReview.courseId, courseId),
			columns: {
				rating: true,
			},
		})

		if (reviews.length > 0) {
			const totalReview = reviews.length
			const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReview

			// Get total enrollments (customers) for this course
			const enrollments = await db.query.enrollment.findMany({
				where: (enroll, { eq }) => eq(enroll.courseId, courseId),
				columns: {
					id: true,
				},
			})

			const totalCustomer = enrollments.length

			// Update course statistics
			await db
				.update(course)
				.set({
					averageRating,
					totalReview,
					totalCustomer,
				})
				.where(eq(course.id, courseId))
		}
	}

	console.log(`   Created: ${reviewsCreated} reviews`)
	console.log(`   Skipped: ${reviewsSkipped} reviews (already exist)`)
}

async function main() {
	await addCourses()
	await addReviews()
}

main()
	.then(() => {
		console.log("🎉 Done!")
		process.exit(0)
	})
	.catch((error) => {
		console.error("❌ Error adding mock data:", error)
		process.exit(1)
	})
