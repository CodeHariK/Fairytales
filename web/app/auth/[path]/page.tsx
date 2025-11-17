import { SiteHeader } from "@/components/nav/site-header"
import { AuthView } from "@daveyplate/better-auth-ui"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamicParams = false

export function generateStaticParams() {
	return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
	const { path } = await params

	return (
		<main className="relative flex min-h-screen items-center justify-center p-4">
			<Link href="/" className="absolute left-4 top-4">
				<Button variant="outline" size="icon">
					<ArrowLeft className="h-4 w-4" />
					<span className="sr-only">Back to home</span>
				</Button>
			</Link>

			<div className="flex w-full max-w-md flex-col items-center gap-6">
				<div className="flex flex-row items-center gap-2 text-center">
					<div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-400 text-white font-bold text-xl">
						C
					</div>
					<h1 className="text-2xl font-semibold">Fairytales</h1>
				</div>

				{/* Auth View */}
				<AuthView path={path} />
			</div>
		</main>
	)
}
