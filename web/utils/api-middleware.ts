import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/utils/auth"
import { env } from "./env"

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

type RouteContext = {
	params?: Promise<Record<string, string | string[]>>
}

type AuthenticatedRouteHandler = (
	request: NextRequest,
	session: Session | null,
	context: RouteContext
) => Promise<NextResponse>

/**
 * Middleware to protect API routes with authentication
 * Returns 401 Unauthorized if user is not authenticated
 *
 * Set DEBUG_AUTH=true in .env to bypass authentication (development only)
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request, session) => {
 *   return NextResponse.json({ user: session.user })
 * })
 *
 * // With dynamic routes
 * export const GET = withAuth(async (request, session, { params }) => {
 *   const { id } = await params!
 *   return NextResponse.json({ id, user: session.user })
 * })
 * ```
 */
export function withAuth(handler: AuthenticatedRouteHandler) {
	return async (request: NextRequest, context: RouteContext = {}): Promise<NextResponse> => {
		// Bypass auth if DEBUG_AUTH is enabled
		if (env.DEBUG_AUTH) {
			return handler(request, null, context)
		}

		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session) {
			return NextResponse.json(
				{
					error: "Unauthorized",
				},
				{ status: 401 }
			)
		}

		return handler(request, session, context)
	}
}
