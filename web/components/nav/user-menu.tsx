"use client"

import { LogOut, UserCircle, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/utils/auth-client"

export function UserMenu() {
	const [mounted, setMounted] = useState(false)
	const { data: session } = authClient.useSession()
	const router = useRouter()

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!session?.user) {
		return (
			<Button
				variant="ghost"
				className="flex items-center gap-2 h-auto p-1.5 ml-2"
				onClick={() => {
					router.push("/auth/sign-in")
				}}
			>
				Sign In
			</Button>
		)
	}

	const initials = session.user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()

	console.log(session)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2 h-auto p-1.5 ml-2">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage
								src={session.user.image || "https://avatar.vercel.sh/fairytales?size=64"}
								alt={session.user.name}
							/>
							<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{session.user.name}</span>
							<span className="text-muted-foreground truncate text-xs">{session.user.email}</span>
						</div>
					</div>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={4}>
				<DropdownMenuItem
					onClick={() => {
						router.push("/account/settings")
					}}
				>
					<UserCircle />
					Account
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={async () => {
						await authClient.signOut()
					}}
				>
					<LogOut />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
