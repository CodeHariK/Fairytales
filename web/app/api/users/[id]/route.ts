import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/utils/api-middleware"

type Data = {
	id: string
	name: string
	email: string
}

export const GET = withAuth(async (request, session, { params }) => {
	const { id } = await params!

	return NextResponse.json({
		id: id,
		name: session?.user.name ?? "Debug User",
		email: session?.user.email ?? "debug@example.com",
	})
})
