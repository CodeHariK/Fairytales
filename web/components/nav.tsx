"use client"

import {
	PlusCircle,
	Mail,
	MoreVertical,
	Folder,
	Share2,
	Trash2,
	ChevronRight,
	type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroupLabel,
	SidebarMenuAction,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	useSidebar,
} from "@/components/ui/sidebar"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavMain({
	items,
}: {
	items: Array<{
		title: string
		url: string
		icon?: LucideIcon
		items?: Array<{
			title: string
			url: string
		}>
	}>
}) {
	const pathname = usePathname()

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						<SidebarMenuButton
							tooltip="Quick Create"
							className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
						>
							<PlusCircle />
							<span>Quick Create</span>
						</SidebarMenuButton>

						<Button
							size="icon"
							className="size-8 group-data-[collapsible=icon]:opacity-0"
							variant="outline"
						>
							<Mail />
							<span className="sr-only">Inbox</span>
						</Button>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map((item) => {
						const isActive =
							!!pathname &&
							(pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url)))

						// Check if any sub-item is active
						const hasActiveSubItem = item.items?.some(
							(subItem) =>
								!!pathname &&
								(pathname === subItem.url ||
									(subItem.url !== "/" && pathname.startsWith(subItem.url)))
						)

						if (item.items && item.items.length > 0) {
							return (
								<Collapsible key={item.title} defaultOpen={isActive || hasActiveSubItem}>
									<SidebarMenuItem>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												tooltip={item.title}
												isActive={isActive || hasActiveSubItem}
												className="group/collapsible"
											>
												{item.icon && <item.icon />}
												<span>{item.title}</span>
												<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items.map((subItem) => {
													const isSubActive =
														!!pathname &&
														(pathname === subItem.url ||
															(subItem.url !== "/" && pathname.startsWith(subItem.url)))
													return (
														<SidebarMenuSubItem key={subItem.title}>
															<SidebarMenuSubButton asChild isActive={isSubActive}>
																<Link href={subItem.url}>
																	<span>{subItem.title}</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													)
												})}
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							)
						}

						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
									<Link href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}

export function NavDocuments({
	items,
}: {
	items: {
		name: string
		url: string
		icon: LucideIcon
	}[]
}) {
	const { isMobile } = useSidebar()
	const pathname = usePathname()

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Documents</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive =
						!!pathname &&
						(pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url)))
					return (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton asChild tooltip={item.name} isActive={isActive}>
								<Link href={item.url}>
									<item.icon />
									<span>{item.name}</span>
								</Link>
							</SidebarMenuButton>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
										<MoreVertical />
										<span className="sr-only">More</span>
									</SidebarMenuAction>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-24 rounded-lg"
									side={isMobile ? "bottom" : "right"}
									align={isMobile ? "end" : "start"}
								>
									<DropdownMenuItem>
										<Folder />
										<span>Open</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Share2 />
										<span>Share</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem variant="destructive">
										<Trash2 />
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					)
				})}
				<SidebarMenuItem>
					<SidebarMenuButton className="text-sidebar-foreground/70">
						<MoreVertical className="text-sidebar-foreground/70" />
						<span>More</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	)
}

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
	}[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const pathname = usePathname()

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
						const isActive =
							!!pathname &&
							(pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url)))
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
									<Link href={item.url}>
										<item.icon />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
