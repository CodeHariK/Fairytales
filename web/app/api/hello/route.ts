import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/utils/api-middleware"

export const GET = withAuth(async (request, session) => {
	return NextResponse.json({
		message: "Hello from Next.js API route!",
		timestamp: new Date().toISOString(),
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
		},
	})
})
