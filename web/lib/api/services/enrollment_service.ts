import { ConnectRouter } from "@connectrpc/connect"
import { EnrollmentService } from "@/gen/courses/v1/enrollments_pb"
import { getEnrollmentById } from "@/lib/api/enrollment_service/getEnrollmentById"
import { getEnrollmentsByUserId } from "@/lib/api/enrollment_service/getEnrollmentsByUserId"
import { getEnrollmentsByCourseId } from "@/lib/api/enrollment_service/getEnrollmentsByCourseId"
import { createEnrollment } from "@/lib/api/enrollment_service/createEnrollment"
import { updateEnrollmentStatus } from "@/lib/api/enrollment_service/updateEnrollmentStatus"
import { healthCheck } from "@/lib/api/enrollment_service/healthCheck"

export default (router: ConnectRouter) => {
	router.service(EnrollmentService, {
		getEnrollmentById,
		getEnrollmentsByUserId,
		getEnrollmentsByCourseId,
		createEnrollment,
		updateEnrollmentStatus,
		healthCheck,
	})
}
