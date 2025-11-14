"use client"

import * as React from "react"
import { useQuery } from "@connectrpc/connect-query"
import { getCoursesByCreatorId } from "@/gen/courses/v1/courses-CourseService_connectquery"
import { CourseLevel, CourseStatus } from "@/gen/courses/v1/courses_pb"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/modified/pagination"
import { CourseCard, type Course, type CourseLevelDisplay } from "@/components/course-card"
import { uuidToHexString } from "@/utils/uuid"

type CourseStatusDisplay = "active" | "draft" | "archived"

interface CourseWithStatus extends Course {
	status: CourseStatusDisplay
}

// Map proto enum values to display strings
const levelMap: Record<CourseLevel, CourseLevelDisplay> = {
	[CourseLevel.BEGINNER]: "Beginner",
	[CourseLevel.INTERMEDIATE]: "Intermediate",
	[CourseLevel.ADVANCED]: "Advanced",
	[CourseLevel.UNSPECIFIED]: "Beginner",
}

const statusMap: Record<CourseStatus, CourseStatusDisplay> = {
	[CourseStatus.ACTIVE]: "active",
	[CourseStatus.DRAFT]: "draft",
	[CourseStatus.ARCHIVED]: "archived",
	[CourseStatus.UNSPECIFIED]: "active",
}

export function CourseGrid() {
	const [filter, setFilter] = React.useState<CourseStatus | "all">("all")
	const [currentPage, setCurrentPage] = React.useState(1)
	const itemsPerPage = 12

	// Reset to page 1 when filter changes
	React.useEffect(() => {
		setCurrentPage(1)
	}, [filter])

	// 16-byte zero UUID (all zeros)
	const zeroCreatorId = React.useMemo(() => new Uint8Array(16), [])

	const { data, isLoading, error } = useQuery(
		getCoursesByCreatorId,
		{
			creatorId: zeroCreatorId,
			...(filter !== "all" && { statusFilter: filter }),
		},
		{
			enabled: true,
		}
	)

	// Transform proto enum values to display strings
	const courses: CourseWithStatus[] = React.useMemo(() => {
		if (!data?.courses) return []
		return data.courses.map((course) => {
			// Convert bytes to hex string
			const id = course.id ? uuidToHexString(course.id) : ""

			// Convert categoryIds to a string (use first category or default)
			const category =
				course.categoryIds && course.categoryIds.length > 0
					? uuidToHexString(course.categoryIds[0])
					: "Uncategorized"

			return {
				id,
				title: course.title,
				category,
				lessons: Array.isArray(course.lessons) ? course.lessons.length : course.lessons || 0,
				hours: 0, // Not available in proto, default to 0
				students: 0, // Not available in proto, default to 0
				price: course.price || 0,
				image: course.image || "",
				level: levelMap[course.level] || "Beginner",
				status: statusMap[course.status] || "active",
			}
		})
	}, [data])

	const total = courses.length
	const totalPages = Math.ceil(total / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const paginatedCourses = courses.slice(startIndex, endIndex)

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<ToggleGroup
					type="single"
					value={filter === "all" ? "all" : filter.toString()}
					onValueChange={(value) => {
						if (value === "all") {
							setFilter("all")
						} else {
							const statusValue = parseInt(value, 10) as CourseStatus
							if (Object.values(CourseStatus).includes(statusValue)) {
								setFilter(statusValue)
							}
						}
					}}
					variant="outline"
					spacing={0}
				>
					<ToggleGroupItem value="all">All</ToggleGroupItem>
					<ToggleGroupItem value={CourseStatus.ACTIVE.toString()}>Active</ToggleGroupItem>
					<ToggleGroupItem value={CourseStatus.DRAFT.toString()}>Draft</ToggleGroupItem>
					<ToggleGroupItem value={CourseStatus.ARCHIVED.toString()}>Archived</ToggleGroupItem>
				</ToggleGroup>

				<Select defaultValue="all">
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="All Category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Category</SelectItem>
						<SelectItem value="web">Web Development</SelectItem>
						<SelectItem value="marketing">Marketing</SelectItem>
						<SelectItem value="business">Business</SelectItem>
						<SelectItem value="data">Data Science</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{error && <div className="px-4 lg:px-6 text-sm text-destructive">Error: {error.message}</div>}

			{isLoading ? (
				<div className="px-4 lg:px-6 text-sm text-muted-foreground">Loading courses...</div>
			) : (
				<div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:px-6">
					{paginatedCourses.map((course) => (
						<CourseCard key={course.id} course={course} />
					))}
				</div>
			)}

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalItems={total}
				itemsPerPage={itemsPerPage}
				onPageChange={setCurrentPage}
			/>
		</div>
	)
}
