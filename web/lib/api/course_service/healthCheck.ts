import { createClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { CourseService } from "@/gen/courses/v1/courses_pb"
import { uuidToHexString } from "@/utils/uuid"
import type {
	HealthCheckRequest,
	HealthCheckResponse,
	RouteHealth,
} from "@/gen/health/v1/health_pb"
import { create } from "@bufbuild/protobuf"
import { HealthCheckResponseSchema, RouteHealthSchema } from "@/gen/health/v1/health_pb"
import { BASE_URL } from "@/utils/constants"
import { MockDataStore } from "../mock/mock-data"

export async function healthCheck(req: HealthCheckRequest): Promise<HealthCheckResponse> {
	// Create a client to test all routes
	const transport = createConnectTransport({
		baseUrl: `${BASE_URL}/api`,
		useBinaryFormat: false,
	})

	const client = createClient(CourseService, transport)

	const routes: RouteHealth[] = []
	let createdCourseId: Uint8Array | null = null

	// Test createCourse
	try {
		const createResponse = await client.createCourse({
			title: "health-check-test",
			creatorId: MockDataStore.mockCreatorId,
		})
		if (createResponse.course?.id) {
			createdCourseId = createResponse.course.id
		}
		routes.push(
			create(RouteHealthSchema, {
				name: "createCourse",
				ok: !!createResponse.course?.id,
				error: createResponse.course?.id ? undefined : "Course ID not returned",
			})
		)
	} catch (error) {
		routes.push(
			create(RouteHealthSchema, {
				name: "createCourse",
				ok: false,
				error: (error as Error).message,
			})
		)
	}

	// Test getCoursesByUserId
	try {
		await client.getCoursesByUserId({
			userId: MockDataStore.mockCreatorId,
		})
		routes.push(
			create(RouteHealthSchema, {
				name: "getCoursesByUserId",
				ok: true,
			})
		)
	} catch (error) {
		routes.push(
			create(RouteHealthSchema, {
				name: "getCoursesByUserId",
				ok: false,
				error: (error as Error).message,
			})
		)
	}

	// Test getCoursesByCreatorId - verify the created course appears in the list
	try {
		const response = await client.getCoursesByCreatorId({
			creatorId: MockDataStore.mockCreatorId,
		})
		// Check if the created course is in the list
		const courseFound = createdCourseId
			? response.courses.some(
					(course) =>
						course.id.length === createdCourseId!.length &&
						course.id.every((byte, i) => byte === createdCourseId![i])
				)
			: false

		routes.push(
			create(RouteHealthSchema, {
				name: "getCoursesByCreatorId",
				ok: createdCourseId ? courseFound : true,
				error: createdCourseId && !courseFound ? "Created course not found in list" : undefined,
			})
		)
	} catch (error) {
		routes.push(
			create(RouteHealthSchema, {
				name: "getCoursesByCreatorId",
				ok: false,
				error: (error as Error).message,
			})
		)
	}

	// Test getCourseById - use the created course ID
	try {
		if (!createdCourseId) {
			routes.push(
				create(RouteHealthSchema, {
					name: "getCourseById",
					ok: false,
					error: "Cannot test: createCourse failed",
				})
			)
		} else {
			const response = await client.getCourseById({
				id: createdCourseId,
			})
			// Verify the course matches what we created
			const courseMatches =
				response.course?.title === "health-check-test" &&
				response.course?.id &&
				response.course.id.length === createdCourseId.length &&
				response.course.id.every((byte, i) => byte === createdCourseId[i])

			routes.push(
				create(RouteHealthSchema, {
					name: "getCourseById",
					ok: !!courseMatches,
					error: courseMatches ? undefined : "Retrieved course does not match created course",
				})
			)
		}
	} catch (error) {
		routes.push(
			create(RouteHealthSchema, {
				name: "getCourseById",
				ok: false,
				error: (error as Error).message,
			})
		)
	}

	// Test updateCourse
	try {
		if (!createdCourseId) {
			routes.push(
				create(RouteHealthSchema, {
					name: "updateCourse",
					ok: false,
					error: "Cannot test: createCourse failed",
				})
			)
		} else {
			const response = await client.updateCourse({
				id: createdCourseId,
				title: "health-check-test-updated",
			})
			// Verify the course matches what we created
			const courseMatches =
				response.course?.title === "health-check-test-updated" &&
				response.course?.id &&
				response.course.id.length === createdCourseId.length &&
				response.course.id.every((byte, i) => byte === createdCourseId[i])

			routes.push(
				create(RouteHealthSchema, {
					name: "updateCourse",
					ok: !!courseMatches,
					error: courseMatches ? undefined : "Retrieved course does not match updated course",
				})
			)
		}
	} catch (error) {
		routes.push(
			create(RouteHealthSchema, {
				name: "updateCourse",
				ok: false,
				error: (error as Error).message,
			})
		)
	}

	// Test deleteCourse
	try {
		if (!createdCourseId) {
			routes.push(
				create(RouteHealthSchema, {
					name: "deleteCourse",
					ok: false,
					error: "Cannot test: createCourse failed",
				})
			)
		} else {
			await client.deleteCourse({
				id: createdCourseId,
			})
		}
	} catch (error) {
		routes.push(
			create(RouteHealthSchema, {
				name: "deleteCourse",
				ok: false,
				error: (error as Error).message,
			})
		)
	}

	const allOk = routes.every((route) => route.ok)

	return create(HealthCheckResponseSchema, {
		ok: allOk,
		routes,
	})
}
