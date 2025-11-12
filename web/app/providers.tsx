"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { authClient } from "@/utils/auth-client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TransportProvider } from "@connectrpc/connect-query"
import { createConnectTransport } from "@connectrpc/connect-web"
import { useState } from "react"

import { ThemeProvider } from "next-themes"

const transport = createConnectTransport({
	baseUrl: "/api",
})

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter()

	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
					},
				},
			})
	)

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<AuthUIProvider
				authClient={authClient}
				navigate={router.push}
				replace={router.replace}
				onSessionChange={() => {
					// Clear router cache (protected routes)
					router.refresh()
				}}
				Link={Link}
				social={{
					providers: ["google"],
				}}
				magicLink
				passkey
				apiKey={{}}
				viewPaths={{}}
				account={{}}
				organization={{
					logo: {
						// upload: async (file) => {
						//     // Your upload logic
						//     return uploadedUrl
						// },
						size: 256,
						extension: "png",
					},
					customRoles: [
						{
							role: "developer",
							label: "Developer",
						},
						{
							role: "viewer",
							label: "Viewer",
						},
					],
				}}
			>
				<TransportProvider transport={transport}>
					<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
				</TransportProvider>
			</AuthUIProvider>
		</ThemeProvider>
	)
}
