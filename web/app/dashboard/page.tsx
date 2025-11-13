"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Loader2, MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/new/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/modified/sidebar"
import { AcademyHeader } from "@/components/dashboard/academy-header"
import { Leaderboard } from "@/components/dashboard/leaderboard"
import { SuccessRate } from "@/components/dashboard/success-rate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/modified/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer"
import { VisitorChart } from "@/components/visitor-chart"
import { useIsMobile } from "@/hooks/use-mobile"

import data from "./data.json"

type TableData = {
	id: number
	header: string
	type: string
	status: string
	target: string
	limit: string
	reviewer: string
}

function TableCellInfoViewer({ item }: { item: TableData }) {
	const isMobile = useIsMobile()

	return (
		<Drawer direction={isMobile ? "bottom" : "right"}>
			<DrawerTrigger asChild>
				<Button variant="link" className="text-foreground w-fit px-0 text-left">
					{item.header}
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="gap-1">
					<DrawerTitle>{item.header}</DrawerTitle>
					<DrawerDescription>Showing total visitors for the last 6 months</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
					{!isMobile && <VisitorChart />}
					<form className="flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							<Label htmlFor="header">Header</Label>
							<Input id="header" defaultValue={item.header} />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="type">Type</Label>
								<Select defaultValue={item.type}>
									<SelectTrigger id="type" className="w-full">
										<SelectValue placeholder="Select a type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Table of Contents">Table of Contents</SelectItem>
										<SelectItem value="Executive Summary">Executive Summary</SelectItem>
										<SelectItem value="Technical Approach">Technical Approach</SelectItem>
										<SelectItem value="Design">Design</SelectItem>
										<SelectItem value="Capabilities">Capabilities</SelectItem>
										<SelectItem value="Focus Documents">Focus Documents</SelectItem>
										<SelectItem value="Narrative">Narrative</SelectItem>
										<SelectItem value="Cover Page">Cover Page</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="status">Status</Label>
								<Select defaultValue={item.status}>
									<SelectTrigger id="status" className="w-full">
										<SelectValue placeholder="Select a status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Done">Done</SelectItem>
										<SelectItem value="In Progress">In Progress</SelectItem>
										<SelectItem value="Not Started">Not Started</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="target">Target</Label>
								<Input id="target" defaultValue={item.target} />
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="limit">Limit</Label>
								<Input id="limit" defaultValue={item.limit} />
							</div>
						</div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="reviewer">Reviewer</Label>
							<Select defaultValue={item.reviewer}>
								<SelectTrigger id="reviewer" className="w-full">
									<SelectValue placeholder="Select a reviewer" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
									<SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
									<SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</form>
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Done</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}

const columns: ColumnDef<TableData>[] = [
	{
		accessorKey: "header",
		header: "Header",
		cell: ({ row }) => {
			return <TableCellInfoViewer item={row.original} />
		},
		enableHiding: false,
	},
	{
		accessorKey: "type",
		header: "Section Type",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.type}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-muted-foreground px-1.5">
				{row.original.status === "Done" ? (
					<CheckCircle2 className="fill-green-500 dark:fill-green-400" />
				) : (
					<Loader2 />
				)}
				{row.original.status}
			</Badge>
		),
	},
	{
		accessorKey: "target",
		header: () => <div className="w-full text-right">Target</div>,
		cell: ({ row }) => (
			<form
				onSubmit={(e) => {
					e.preventDefault()
					toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
						loading: `Saving ${row.original.header}`,
						success: "Done",
						error: "Error",
					})
				}}
			>
				<Label htmlFor={`${row.original.id}-target`} className="sr-only">
					Target
				</Label>
				<Input
					className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
					defaultValue={row.original.target}
					id={`${row.original.id}-target`}
				/>
			</form>
		),
	},
	{
		accessorKey: "limit",
		header: () => <div className="w-full text-right">Limit</div>,
		cell: ({ row }) => (
			<form
				onSubmit={(e) => {
					e.preventDefault()
					toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
						loading: `Saving ${row.original.header}`,
						success: "Done",
						error: "Error",
					})
				}}
			>
				<Label htmlFor={`${row.original.id}-limit`} className="sr-only">
					Limit
				</Label>
				<Input
					className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
					defaultValue={row.original.limit}
					id={`${row.original.id}-limit`}
				/>
			</form>
		),
	},
	{
		accessorKey: "reviewer",
		header: "Reviewer",
		cell: ({ row }) => {
			const isAssigned = row.original.reviewer !== "Assign reviewer"

			if (isAssigned) {
				return row.original.reviewer
			}

			return (
				<>
					<Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
						Reviewer
					</Label>
					<Select>
						<SelectTrigger
							className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
							size="sm"
							id={`${row.original.id}-reviewer`}
						>
							<SelectValue placeholder="Assign reviewer" />
						</SelectTrigger>
						<SelectContent align="end">
							<SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
							<SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
						</SelectContent>
					</Select>
				</>
			)
		},
	},
	{
		id: "actions",
		cell: () => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
						size="icon"
					>
						<MoreVertical />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-32">
					<DropdownMenuItem>Edit</DropdownMenuItem>
					<DropdownMenuItem>Make a copy</DropdownMenuItem>
					<DropdownMenuItem>Favorite</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
]

export default function Page() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6 space-y-4">
								{/* Large screens: 2:1:1 layout */}
								<div className="hidden 2xl:grid grid-cols-4 gap-4">
									<div className="col-span-2">
										<AcademyHeader />
									</div>
									<SuccessRate />
									<Leaderboard />
								</div>

								{/* Medium and small screens: AcademyHeader full width, then 1:1 row */}
								<div className="2xl:hidden space-y-4">
									<AcademyHeader />
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<SuccessRate />
										<Leaderboard />
									</div>
								</div>
							</div>

							<SectionCards />
							<div className="px-4 lg:px-6">
								<ChartAreaInteractive />
							</div>
							<DataTable
								data={data}
								columns={columns}
								enableDrag={true}
								enableSelection={true}
								tabs={[
									{ value: "outline", label: "Outline" },
									{
										value: "past-performance",
										label: "Past Performance",
										badge: 3,
									},
									{
										value: "key-personnel",
										label: "Key Personnel",
										badge: 2,
									},
									{ value: "focus-documents", label: "Focus Documents" },
								]}
								defaultTab="outline"
								showAddButton={true}
								addButtonLabel="Add Section"
							/>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
