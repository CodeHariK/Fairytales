"use client"

import {
	CreditCard,
	LogOut,
	Bell,
	UserCircle,
	MessageCircle,
	Settings,
	Moon,
	Sun,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
	name?: string
	email?: string
	avatar?: string
	role?: string
}

export function UserMenu({
	name = "Phillip Stanton",
	email = "phillip@coursify.com",
	avatar = "/avatars/phillip.jpg",
	role = "Admin",
}: UserMenuProps) {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()

	const isDark = mounted && (resolvedTheme === "dark" || theme === "dark")

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2 h-auto p-1.5 ml-2">
					<Avatar className="h-9 w-9">
						<AvatarImage src={avatar} alt={name} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="hidden lg:block text-left">
						<p className="text-sm font-medium">{name}</p>
						<p className="text-xs text-muted-foreground">{role}</p>
					</div>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={4}>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage src={avatar} alt={name} />
							<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{name}</span>
							<span className="text-muted-foreground truncate text-xs">{email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => {
							if (mounted) {
								setTheme(isDark ? "light" : "dark")
							}
						}}
					>
						{mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
						Theme
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell className="h-4 w-4" />
						Notifications
					</DropdownMenuItem>
					<DropdownMenuItem>
						<MessageCircle className="h-4 w-4" />
						Messages
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings className="h-4 w-4" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<UserCircle />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard />
						Billing
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<LogOut />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
