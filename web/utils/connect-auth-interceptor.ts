import { Interceptor, ConnectError, Code } from "@connectrpc/connect"
import { auth } from "@/utils/auth"
import { env } from "./env"
import { kSession } from "./session-context"

/**
 * Connect RPC interceptor that requires authentication
 * Throws a ConnectError with code UNAUTHENTICATED if user is not authenticated
 *
 * Set DEBUG_AUTH=true in .env to bypass authentication (development only)
 *
 * The session is added to the request context and can be accessed in handlers via:
 * ```ts
 * async handler(req, context) {
 *   const session = context.values.get(kSession)
 *   // Use session...
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

		// Bypass auth check if DEBUG_AUTH is enabled
		if (!env.DEBUG_AUTH) {
			if (!session) {
				throw new ConnectError("Authentication required", Code.Unauthenticated)
			}
		}

		return next(req)
	}
}
