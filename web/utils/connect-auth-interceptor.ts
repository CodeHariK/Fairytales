import { Interceptor, ConnectError, Code } from "@connectrpc/connect"
import { auth } from "@/utils/auth"
import { env } from "./env"

/**
 * Connect RPC interceptor that requires authentication
 * Throws a ConnectError with code UNAUTHENTICATED if user is not authenticated
 *
 * Set DEBUG_AUTH=true in .env to bypass authentication (development only)
 *
 * Handlers can access the session by calling auth.api.getSession() themselves
 * if needed, as the session is validated here.
 */
export function createAuthInterceptor(): Interceptor {
	return (next) => async (req) => {
		// Bypass auth if DEBUG_AUTH is enabled
		if (env.DEBUG_AUTH) {
			return next(req)
		}

		// Convert Connect headers to Headers object for Better Auth
		const headers = new Headers()
		req.header.forEach((value, key) => {
			headers.set(key, value)
		})

		// Get session from request headers
		const session = await auth.api.getSession({
			headers,
		})

		if (!session) {
			throw new ConnectError("Authentication required", Code.Unauthenticated)
		}

		return next(req)
	}
}
