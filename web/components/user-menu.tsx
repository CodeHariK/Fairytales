"use client"

import { CreditCard, LogOut, Bell, UserCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2 h-auto p-1.5 ml-2">
					<Avatar className="h-9 w-9">
						<AvatarImage src={avatar} alt={name} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="hidden sm:block text-left">
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
					<DropdownMenuItem>
						<UserCircle />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell />
						Notifications
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
