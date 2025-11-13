"use client"

import * as React from "react"
import Link from "next/link"
import {
	Camera,
	BarChart3,
	LayoutDashboard,
	Database,
	Sparkles,
	FileText,
	FileText as FileWord,
	Folder,
	HelpCircle,
	Layers,
	List,
	FileBarChart,
	Search,
	Settings,
	Users,
} from "lucide-react"

import { NavDocuments, NavMain, NavSecondary } from "@/components/nav"
import { UpgradePro } from "@/components/upgrade-pro"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
	user: {
		name: "Ciirella",
		email: "ciirella@twitch.com",
		avatar: "/avatars/cirella.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboard,
			items: [
				{
					title: "Create Course",
					url: "/dashboard/create-course",
				},
			],
		},
		{
			title: "Docs",
			url: "/docs",
			icon: FileText,
		},
		{
			title: "Messages",
			url: "#",
			icon: FileText,
		},
		{
			title: "Calendar",
			url: "#",
			icon: List,
		},
		{
			title: "Enrollments",
			url: "#",
			icon: FileWord,
		},
		{
			title: "Courses",
			url: "#",
			icon: Folder,
		},
		{
			title: "Instructors",
			url: "#",
			icon: Users,
		},
		{
			title: "Students",
			url: "#",
			icon: Users,
		},
		{
			title: "Financials",
			url: "#",
			icon: BarChart3,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: Camera,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: FileText,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: Sparkles,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: Settings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: HelpCircle,
		},
		{
			title: "Search",
			url: "#",
			icon: Search,
		},
	],
	documents: [
		{
			name: "Data Library",
			url: "#",
			icon: Database,
		},
		{
			name: "Reports",
			url: "#",
			icon: FileBarChart,
		},
		{
			name: "Word Assistant",
			url: "#",
			icon: FileWord,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							tooltip="Coursify"
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link href="/">
								<div className="flex items-center gap-2">
									<div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-400 text-white font-bold text-xs">
										C
									</div>
									<span className="text-base font-semibold">Coursify</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
				<div className="group-data-[collapsible=icon]:hidden">
					<UpgradePro />
				</div>
			</SidebarContent>
		</Sidebar>
	)
}
