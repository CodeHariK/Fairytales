"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Loader2, MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/nav/app-sidebar"
import { AreaChartInteractive } from "@/components/graph/area-chart"
import { DataTable } from "@/components/new/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/nav/site-header"
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

const chartData = [
	{ date: "2024-04-01", desktop: 222, mobile: 150 },
	{ date: "2024-04-02", desktop: 97, mobile: 180 },
	{ date: "2024-04-03", desktop: 167, mobile: 120 },
	{ date: "2024-04-04", desktop: 242, mobile: 260 },
	{ date: "2024-04-05", desktop: 373, mobile: 290 },
	{ date: "2024-04-06", desktop: 301, mobile: 340 },
	{ date: "2024-04-07", desktop: 245, mobile: 180 },
	{ date: "2024-04-08", desktop: 409, mobile: 320 },
	{ date: "2024-04-09", desktop: 59, mobile: 110 },
	{ date: "2024-04-10", desktop: 261, mobile: 190 },
	{ date: "2024-04-11", desktop: 327, mobile: 350 },
	{ date: "2024-04-12", desktop: 292, mobile: 210 },
	{ date: "2024-04-13", desktop: 342, mobile: 380 },
	{ date: "2024-04-14", desktop: 137, mobile: 220 },
	{ date: "2024-04-15", desktop: 120, mobile: 170 },
	{ date: "2024-04-16", desktop: 138, mobile: 190 },
	{ date: "2024-04-17", desktop: 446, mobile: 360 },
	{ date: "2024-04-18", desktop: 364, mobile: 410 },
	{ date: "2024-04-19", desktop: 243, mobile: 180 },
	{ date: "2024-04-20", desktop: 89, mobile: 150 },
	{ date: "2024-04-21", desktop: 137, mobile: 200 },
	{ date: "2024-04-22", desktop: 224, mobile: 170 },
	{ date: "2024-04-23", desktop: 138, mobile: 230 },
	{ date: "2024-04-24", desktop: 387, mobile: 290 },
	{ date: "2024-04-25", desktop: 215, mobile: 250 },
	{ date: "2024-04-26", desktop: 75, mobile: 130 },
	{ date: "2024-04-27", desktop: 383, mobile: 420 },
	{ date: "2024-04-28", desktop: 122, mobile: 180 },
	{ date: "2024-04-29", desktop: 315, mobile: 240 },
	{ date: "2024-04-30", desktop: 454, mobile: 380 },
	{ date: "2024-05-01", desktop: 165, mobile: 220 },
	{ date: "2024-05-02", desktop: 293, mobile: 310 },
	{ date: "2024-05-03", desktop: 247, mobile: 190 },
	{ date: "2024-05-04", desktop: 385, mobile: 420 },
	{ date: "2024-05-05", desktop: 481, mobile: 390 },
	{ date: "2024-05-06", desktop: 498, mobile: 520 },
	{ date: "2024-05-07", desktop: 388, mobile: 300 },
	{ date: "2024-05-08", desktop: 149, mobile: 210 },
	{ date: "2024-05-09", desktop: 227, mobile: 180 },
	{ date: "2024-05-10", desktop: 293, mobile: 330 },
	{ date: "2024-05-11", desktop: 335, mobile: 270 },
	{ date: "2024-05-12", desktop: 197, mobile: 240 },
	{ date: "2024-05-13", desktop: 197, mobile: 160 },
	{ date: "2024-05-14", desktop: 448, mobile: 490 },
	{ date: "2024-05-15", desktop: 473, mobile: 380 },
	{ date: "2024-05-16", desktop: 338, mobile: 400 },
	{ date: "2024-05-17", desktop: 499, mobile: 420 },
	{ date: "2024-05-18", desktop: 315, mobile: 350 },
	{ date: "2024-05-19", desktop: 235, mobile: 180 },
	{ date: "2024-05-20", desktop: 177, mobile: 230 },
	{ date: "2024-05-21", desktop: 82, mobile: 140 },
	{ date: "2024-05-22", desktop: 81, mobile: 120 },
	{ date: "2024-05-23", desktop: 252, mobile: 290 },
	{ date: "2024-05-24", desktop: 294, mobile: 220 },
	{ date: "2024-05-25", desktop: 201, mobile: 250 },
	{ date: "2024-05-26", desktop: 213, mobile: 170 },
	{ date: "2024-05-27", desktop: 420, mobile: 460 },
	{ date: "2024-05-28", desktop: 233, mobile: 190 },
	{ date: "2024-05-29", desktop: 78, mobile: 130 },
	{ date: "2024-05-30", desktop: 340, mobile: 280 },
	{ date: "2024-05-31", desktop: 178, mobile: 230 },
	{ date: "2024-06-01", desktop: 178, mobile: 200 },
	{ date: "2024-06-02", desktop: 470, mobile: 410 },
	{ date: "2024-06-03", desktop: 103, mobile: 160 },
	{ date: "2024-06-04", desktop: 439, mobile: 380 },
	{ date: "2024-06-05", desktop: 88, mobile: 140 },
	{ date: "2024-06-06", desktop: 294, mobile: 250 },
	{ date: "2024-06-07", desktop: 323, mobile: 370 },
	{ date: "2024-06-08", desktop: 385, mobile: 320 },
	{ date: "2024-06-09", desktop: 438, mobile: 480 },
	{ date: "2024-06-10", desktop: 155, mobile: 200 },
	{ date: "2024-06-11", desktop: 92, mobile: 150 },
	{ date: "2024-06-12", desktop: 492, mobile: 420 },
	{ date: "2024-06-13", desktop: 81, mobile: 130 },
	{ date: "2024-06-14", desktop: 426, mobile: 380 },
	{ date: "2024-06-15", desktop: 307, mobile: 350 },
	{ date: "2024-06-16", desktop: 371, mobile: 310 },
	{ date: "2024-06-17", desktop: 475, mobile: 520 },
	{ date: "2024-06-18", desktop: 107, mobile: 170 },
	{ date: "2024-06-19", desktop: 341, mobile: 290 },
	{ date: "2024-06-20", desktop: 408, mobile: 450 },
	{ date: "2024-06-21", desktop: 169, mobile: 210 },
	{ date: "2024-06-22", desktop: 317, mobile: 270 },
	{ date: "2024-06-23", desktop: 480, mobile: 530 },
	{ date: "2024-06-24", desktop: 132, mobile: 180 },
	{ date: "2024-06-25", desktop: 141, mobile: 190 },
	{ date: "2024-06-26", desktop: 434, mobile: 380 },
	{ date: "2024-06-27", desktop: 448, mobile: 490 },
	{ date: "2024-06-28", desktop: 149, mobile: 200 },
	{ date: "2024-06-29", desktop: 103, mobile: 160 },
	{ date: "2024-06-30", desktop: 446, mobile: 400 },
]

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
								<AreaChartInteractive
									data={chartData}
									seriesKeys={["desktop", "mobile"]}
									xAxisKey="date"
									title="Total Visitors"
									description="Total for the last 3 months"
								/>
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
