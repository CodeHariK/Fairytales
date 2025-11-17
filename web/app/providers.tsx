"use client"

import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack"
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/utils/auth-client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TransportProvider } from "@connectrpc/connect-query"
import { createConnectTransport } from "@connectrpc/connect-web"
import { useState } from "react"

import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"

import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

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
		<TransportProvider transport={transport}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					storageKey="theme"
				>
					<AuthQueryProvider>
						<AuthUIProviderTanstack
							authClient={authClient}
							navigate={router.push}
							persistClient={false}
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
							{children}

							<TanStackDevtools
								plugins={[
									{
										name: "TanStack Query",
										render: <ReactQueryDevtools />,
										defaultOpen: false,
									},
									formDevtoolsPlugin(),
								]}
							/>
						</AuthUIProviderTanstack>
					</AuthQueryProvider>

					<Toaster />
				</ThemeProvider>
			</QueryClientProvider>
		</TransportProvider>
	)
}
