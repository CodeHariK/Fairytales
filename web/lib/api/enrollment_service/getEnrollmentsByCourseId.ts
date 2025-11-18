import { create } from "@bufbuild/protobuf"
import { HandlerContext } from "@connectrpc/connect"
import {
	GetEnrollmentsByCourseIdResponseSchema,
	EnrollmentSchema,
} from "@/gen/courses/v1/enrollments_pb"
import type {
	GetEnrollmentsByCourseIdRequest,
	GetEnrollmentsByCourseIdResponse,
} from "@/gen/courses/v1/enrollments_pb"
import { ConnectError, Code } from "@connectrpc/connect"
import { db } from "@/utils/pg"
import { enrollment } from "@/schema/schema"
import { and, eq } from "drizzle-orm"
import { requireAuth } from "@/utils/connect-auth-interceptor"
import { hexStringToUuid, uuidToHexString } from "@/utils/uuid"

export async function getEnrollmentsByCourseId(
	req: GetEnrollmentsByCourseIdRequest,
	context: HandlerContext
): Promise<GetEnrollmentsByCourseIdResponse> {
	// Require authentication
	await requireAuth(context)

	const courseId = uuidToHexString(req.courseId)

	// Build where clause
	const whereConditions = [eq(enrollment.courseId, courseId)]

	// Add status filter if provided
	if (req.statusFilter !== undefined && req.statusFilter !== 0) {
		const statusMap: Record<number, string> = {
			1: "pending",
			2: "completed",
			3: "failed",
		}
		const statusString = statusMap[req.statusFilter]
		if (statusString) {
			whereConditions.push(eq(enrollment.status, statusString))
		}
	}

	// Get enrollments
	const enrollmentsData = await db.query.enrollment.findMany({
		where: and(...whereConditions),
		orderBy: (enrollment, { desc }) => [desc(enrollment.createdAt)],
	})

	// Pagination
	const page = req.page || 1
	const pageSize = req.pageSize || 10
	const total = enrollmentsData.length
	const totalPages = Math.ceil(total / pageSize)
	const startIndex = (page - 1) * pageSize
	const endIndex = startIndex + pageSize
	const paginatedEnrollments = enrollmentsData.slice(startIndex, endIndex)

	// Map status string to enum
	const statusMap: Record<string, number> = {
		pending: 1,
		completed: 2,
		failed: 3,
	}

	const enrollments = paginatedEnrollments.map((enrollmentData) =>
		create(EnrollmentSchema, {
			id: hexStringToUuid(enrollmentData.id),
			userId: hexStringToUuid(enrollmentData.userId),
			courseId: hexStringToUuid(enrollmentData.courseId),
			status: statusMap[enrollmentData.status] || 0,
			stripePaymentIntentId: enrollmentData.stripePaymentIntentId || undefined,
			stripeCheckoutSessionId: enrollmentData.stripeCheckoutSessionId || undefined,
			createdAt: enrollmentData.createdAt.toISOString(),
			updatedAt: enrollmentData.updatedAt.toISOString(),
		})
	)

	return create(GetEnrollmentsByCourseIdResponseSchema, {
		enrollments,
		total,
		page,
		pageSize,
		totalPages,
	})
}
