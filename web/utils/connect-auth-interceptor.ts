import { Interceptor, ConnectError, Code, HandlerContext } from "@connectrpc/connect"
import { auth } from "@/utils/auth"
import { kSession } from "./session-context"

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

/**
 * Connect RPC interceptor that adds session to request context (without requiring authentication).
 *
 * The session is added to the request context and can be accessed in handlers via:
 * ```ts
 * async handler(req, context) {
 *   const session = context.values.get(kSession)
 *   // Use session...
 * }
 * ```
 *
 * To require authentication in a handler, use `requireAuth(context)`:
 * ```ts
 * async handler(req, context) {
 *   const session = await requireAuth(context)
 *   // session is guaranteed to be non-null here
 * }
 * ```
 */
export function createAuthInterceptor(): Interceptor {
	return (next) => async (req) => {
		// Convert Connect headers to Headers object for Better Auth
		const headers = new Headers()
		req.header.forEach((value, key) => {
			headers.set(key, value)
		})

		// Get session from request headers
		const session = await auth.api.getSession({
			headers,
		})

		// Add session to request context so all routes can access it
		req.contextValues.set(kSession, session)

		return next(req)
	}
}

/**
 * Require authentication in a handler.
 * Throws a ConnectError with code UNAUTHENTICATED if user is not authenticated.
 *
 * @param context - The handler context from Connect RPC
 * @returns The authenticated session (guaranteed to be non-null)
 * @throws ConnectError with Code.Unauthenticated if no session exists
 *
 * @example
 * ```ts
 * async function myHandler(req, context) {
 *   const session = await requireAuth(context)
 *   // Use session.user.id, etc.
 * }
 * ```
 */
export async function requireAuth(context: HandlerContext): Promise<Session> {
	const session = context.values.get(kSession)

	if (!session) {
		throw new ConnectError("Authentication required", Code.Unauthenticated)
	}

	return session
}
