import { describe, it, expect } from "bun:test"
import { createClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { CourseService } from "@/gen/courses/v1/courses_pb"
import { BASE_URL } from "@/utils/constants"

describe("[integration] CourseService.HealthCheck", () => {
	it("verifies all course service endpoints are working", async () => {
		const transport = createConnectTransport({
			baseUrl: `${BASE_URL}/api`,
			useBinaryFormat: false,
		})

		const client = createClient(CourseService, transport)

		const response = await client.healthCheck({}).catch((error) => {
			throw new Error(
				`Could not connect to course service. Start the dev server: bun run dev. Error: ${error.message}`
			)
		})

		// Check if all routes are working
		const failedRoutes = response.routes.filter((route) => !route.ok)
		if (failedRoutes.length > 0) {
			const errorMessages = response.routes
				.map((route) => `  - ${route.ok ? "ok" : "failed"} : ${route.name} : ${route.error || "-"}`)
				.join("\n")
			console.log(errorMessages)
		}

		expect(response.ok).toBe(true)
	})
})
