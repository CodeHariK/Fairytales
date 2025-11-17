"use client"

import * as React from "react"
import { useQuery } from "@connectrpc/connect-query"
import { getEnrollmentsByUserId } from "@/gen/courses/v1/enrollments-EnrollmentService_connectquery"
import { EnrollmentStatus } from "@/gen/courses/v1/enrollments_pb"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/nav/site-header"
import { SidebarInset, SidebarProvider } from "@/components/modified/sidebar"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/modified/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Loader2,
	BookOpen,
	Calendar,
	CheckCircle2,
	Clock,
	XCircle,
	ExternalLink,
} from "lucide-react"
import { uuidToHexString } from "@/utils/uuid"
import { useRouter } from "next/navigation"
import { getCoursesByIds } from "./actions"

// Map enrollment status to display
const statusMap: Record<
	number,
	{
		label: string
		variant: "default" | "secondary" | "destructive" | "outline"
		icon: React.ReactNode
	}
> = {
	1: {
		label: "Pending",
		variant: "secondary",
		icon: <Clock className="h-3 w-3" />,
	},
	2: {
		label: "Completed",
		variant: "default",
		icon: <CheckCircle2 className="h-3 w-3" />,
	},
	3: {
		label: "Failed",
		variant: "destructive",
		icon: <XCircle className="h-3 w-3" />,
	},
}

export default function EnrollmentsPage() {
	const router = useRouter()
	const [statusFilter, setStatusFilter] = React.useState<EnrollmentStatus | undefined>(undefined)
	const [page, setPage] = React.useState(1)
	const pageSize = 10
	const [coursesMap, setCoursesMap] = React.useState<
		Record<string, { title: string; image: string | null; price: number }>
	>({})

	const { data, isLoading, error } = useQuery(
		getEnrollmentsByUserId,
		{
			statusFilter,
			page,
			pageSize,
		},
		{
			enabled: true,
		}
	)

	const enrollments = data?.enrollments || []
	const total = data?.total || 0
	const totalPages = data?.totalPages || 0

	// Fetch course data for enrollments
	React.useEffect(() => {
		if (enrollments.length > 0) {
			const courseIds = enrollments.map((e) => uuidToHexString(e.courseId))
			getCoursesByIds(courseIds).then((courses) => {
				const map: Record<string, { title: string; image: string | null; price: number }> = {}
				courses.forEach((course) => {
					map[course.id] = {
						title: course.title,
						image: course.image,
						price: course.price,
					}
				})
				setCoursesMap(map)
			})
		}
	}, [enrollments])

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
							<div className="px-4 lg:px-6">
								<div className="mb-6">
									<h1 className="text-3xl font-bold tracking-tight">My Enrollments</h1>
									<p className="text-muted-foreground mt-2">
										View and manage all your course enrollments
									</p>
								</div>

								{/* Status Filter */}
								<div className="mb-6 flex gap-2">
									<Button
										variant={statusFilter === undefined ? "default" : "outline"}
										size="sm"
										onClick={() => setStatusFilter(undefined)}
									>
										All
									</Button>
									<Button
										variant={statusFilter === EnrollmentStatus.PENDING ? "default" : "outline"}
										size="sm"
										onClick={() => setStatusFilter(EnrollmentStatus.PENDING)}
									>
										Pending
									</Button>
									<Button
										variant={statusFilter === EnrollmentStatus.COMPLETED ? "default" : "outline"}
										size="sm"
										onClick={() => setStatusFilter(EnrollmentStatus.COMPLETED)}
									>
										Completed
									</Button>
									<Button
										variant={statusFilter === EnrollmentStatus.FAILED ? "default" : "outline"}
										size="sm"
										onClick={() => setStatusFilter(EnrollmentStatus.FAILED)}
									>
										Failed
									</Button>
								</div>

								{/* Enrollments List */}
								{isLoading ? (
									<div className="flex items-center justify-center py-12">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : error ? (
									<Card>
										<CardContent className="pt-6">
											<p className="text-destructive">Error loading enrollments: {error.message}</p>
										</CardContent>
									</Card>
								) : enrollments.length === 0 ? (
									<Card>
										<CardContent className="pt-6">
											<div className="flex flex-col items-center justify-center py-12 text-center">
												<BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
												<h3 className="text-lg font-semibold">No enrollments found</h3>
												<p className="text-muted-foreground mt-2">
													{statusFilter
														? `You don't have any ${statusMap[statusFilter]?.label.toLowerCase()} enrollments.`
														: "You haven't enrolled in any courses yet."}
												</p>
												<Button className="mt-4" onClick={() => router.push("/dashboard")}>
													Browse Courses
												</Button>
											</div>
										</CardContent>
									</Card>
								) : (
									<div className="space-y-4">
										{enrollments.map((enrollment) => {
											const courseId = uuidToHexString(enrollment.courseId)
											const course = coursesMap[courseId]
											const status = statusMap[enrollment.status] || statusMap[1]
											const enrollmentDate = new Date(enrollment.createdAt)

											return (
												<Card key={uuidToHexString(enrollment.id)}>
													<CardHeader>
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1">
																<CardTitle className="flex items-center gap-2">
																	<BookOpen className="h-5 w-5" />
																	{course?.title || `Course ${courseId.slice(0, 8)}...`}
																</CardTitle>
																<CardDescription className="mt-2">
																	Enrolled on{" "}
																	{enrollmentDate.toLocaleDateString("en-US", {
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	})}
																	{course?.price && <span className="ml-2">• ${course.price}</span>}
																</CardDescription>
															</div>
															<Badge
																variant={status.variant}
																className="flex items-center gap-1 shrink-0"
															>
																{status.icon}
																{status.label}
															</Badge>
														</div>
													</CardHeader>
													<CardContent>
														<div className="space-y-3">
															<div className="flex items-center gap-2 text-sm text-muted-foreground">
																<Calendar className="h-4 w-4" />
																<span>Created: {enrollmentDate.toLocaleString()}</span>
															</div>
															{enrollment.stripeCheckoutSessionId && (
																<div className="text-sm text-muted-foreground">
																	Payment Session: {enrollment.stripeCheckoutSessionId.slice(0, 20)}
																	...
																</div>
															)}
															<div className="flex gap-2 pt-2">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => router.push(`/courses/${courseId}`)}
																>
																	<ExternalLink className="h-4 w-4 mr-2" />
																	View Course
																</Button>
															</div>
														</div>
													</CardContent>
												</Card>
											)
										})}
									</div>
								)}

								{/* Pagination */}
								{totalPages > 1 && (
									<div className="mt-6 flex items-center justify-between">
										<div className="text-sm text-muted-foreground">
											Showing page {page} of {totalPages} ({total} total enrollments)
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.max(1, p - 1))}
												disabled={page === 1}
											>
												Previous
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
												disabled={page === totalPages}
											>
												Next
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
