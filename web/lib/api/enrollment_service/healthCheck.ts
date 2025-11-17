import { create } from "@bufbuild/protobuf"
import type { HealthCheckRequest, HealthCheckResponse } from "@/gen/health/v1/health_pb"
import { HealthCheckResponseSchema, RouteHealthSchema } from "@/gen/health/v1/health_pb"

export async function healthCheck(req: HealthCheckRequest): Promise<HealthCheckResponse> {
	// Simple health check - all routes are accessible
	const routes = [
		create(RouteHealthSchema, {
			name: "getEnrollmentById",
			ok: true,
		}),
		create(RouteHealthSchema, {
			name: "getEnrollmentsByUserId",
			ok: true,
		}),
		create(RouteHealthSchema, {
			name: "getEnrollmentsByCourseId",
			ok: true,
		}),
		create(RouteHealthSchema, {
			name: "createEnrollment",
			ok: true,
		}),
		create(RouteHealthSchema, {
			name: "updateEnrollmentStatus",
			ok: true,
		}),
	]

	return create(HealthCheckResponseSchema, {
		ok: true,
		routes,
	})
}
