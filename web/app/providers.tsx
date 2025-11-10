"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TransportProvider } from "@connectrpc/connect-query"
import { createConnectTransport } from "@connectrpc/connect-web"
import { useState } from "react"

const transport = createConnectTransport({
    baseUrl: "/api",
})

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            }),
    )

    return (
        <TransportProvider transport={transport}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </TransportProvider>
    )
}

