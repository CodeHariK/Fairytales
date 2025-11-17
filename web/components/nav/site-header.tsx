"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/modified/input"
import { SidebarTrigger } from "@/components/modified/sidebar"
import { ThemeSwitcher } from "@/components/new/theme-switcher"
import { UserButton } from "@daveyplate/better-auth-ui"
import { useIsMobile } from "@/hooks/use-mobile"

export function SiteHeader() {
	const isMobile = useIsMobile()

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-4 px-4 lg:px-6">
				<SidebarTrigger className="-ml-1" />

				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input type="search" placeholder="Search anything" className="pl-9 w-full" />
				</div>

				<div className="ml-auto flex items-center gap-2">
					<ThemeSwitcher />
					<UserButton
						size={isMobile ? "icon" : "default"}
						className="w-64 bg-card text-body-foreground"
						additionalLinks={[]}
					/>
				</div>
			</div>
		</header>
	)
}
