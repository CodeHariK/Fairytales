import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import { GetEnrollmentByIdResponseSchema, EnrollmentSchema } from "@/gen/courses/v1/enrollments_pb"
import type {
	GetEnrollmentByIdRequest,
	GetEnrollmentByIdResponse,
} from "@/gen/courses/v1/enrollments_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { enrollment } from "@/schema/schema"
import { eq } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function getEnrollmentById(
	req: GetEnrollmentByIdRequest,
	context: HandlerContext
): Promise<GetEnrollmentByIdResponse> {
	// Require authentication
	await requireAuth(context)

	const enrollmentId = uuidToHexString(req.id)

	const enrollmentData = await db.query.enrollment.findFirst({
		where: eq(enrollment.id, enrollmentId),
	})

	if (!enrollmentData) {
		throw new ConnectError("Enrollment not found", Code.NotFound)
	}

	// Map status string to enum
	const statusMap: Record<string, number> = {
		pending: 1, // ENROLLMENT_STATUS_PENDING
		completed: 2, // ENROLLMENT_STATUS_COMPLETED
		failed: 3, // ENROLLMENT_STATUS_FAILED
	}

	const enrollmentProto = create(EnrollmentSchema, {
		id: req.id,
		userId: hexStringToUuid(enrollmentData.userId),
		courseId: hexStringToUuid(enrollmentData.courseId),
		status: statusMap[enrollmentData.status] || 0,
		stripePaymentIntentId: enrollmentData.stripePaymentIntentId || undefined,
		stripeCheckoutSessionId: enrollmentData.stripeCheckoutSessionId || undefined,
		createdAt: enrollmentData.createdAt.toISOString(),
		updatedAt: enrollmentData.updatedAt.toISOString(),
	})

	return create(GetEnrollmentByIdResponseSchema, {
		enrollment: enrollmentProto,
	})
}
