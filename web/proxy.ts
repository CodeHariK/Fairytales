import { NextRequest, NextResponse } from "next/server"
import { getCookieCache } from "better-auth/cookies"
import { env } from "./utils/env"
/**
 * Protected routes that require authentication
 */
const protectedRoutes = ["/dashboard", "/account", "/organization"]

/**
 * Public routes that should be accessible without authentication
 * (auth routes are handled separately)
 */
const publicRoutes = ["/", "/docs", "/auth"]

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Check if the route is protected first (higher priority)
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

	// Check if the route is public (but only if not protected)
	// For "/", only match exactly, not paths that start with "/"
	const isPublicRoute =
		!isProtectedRoute &&
		publicRoutes.some((route) => {
			if (route === "/") {
				return pathname === "/"
			}
			return pathname.startsWith(route)
		})

	// Skip proxy for public routes
	if (isPublicRoute) {
		return NextResponse.next()
	}

	// Check authentication for protected routes
	if (!env.DEBUG_AUTH && isProtectedRoute) {
		// Use cookie cache for faster checks in proxy
		// This avoids full session validation but is sufficient for route protection
		// Uses default cookie name and prefix from Better Auth
		const session = await getCookieCache(request)

		if (!session) {
			// Redirect to sign-in page with callback URL
			const signInUrl = new URL("/auth/sign-in", request.url)
			signInUrl.searchParams.set("callbackUrl", pathname)
			return NextResponse.redirect(signInUrl)
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
	],
}
