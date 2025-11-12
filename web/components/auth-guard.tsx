import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/utils/auth"
import type { ReactNode } from "react"

/**
 * Server component that protects pages by requiring authentication
 * Redirects to sign-in if user is not authenticated
 *
 * @example
 * ```tsx
 * export default async function ProtectedPage() {
 *   return (
 *     <AuthGuard>
 *       <div>Protected content</div>
 *     </AuthGuard>
 *   )
 * }
 * ```
 */
export async function AuthGuard({ children }: { children: ReactNode }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect("/auth/sign-in")
	}

	return <>{children}</>
}
