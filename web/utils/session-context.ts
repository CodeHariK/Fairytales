import { createContextKey } from "@connectrpc/connect"
import { auth } from "./auth"

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

export const kSession = createContextKey<Session | null>(
	null, // Default value (no session)
	{
		description: "Current user session from Better Auth",
	}
)
