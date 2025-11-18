"use client"

import { useQuery, useMutation } from "@connectrpc/connect-query"
import { getCourseById } from "@/gen/courses/v1/courses-CourseService_connectquery"
import { getEnrollmentsByUserId } from "@/gen/courses/v1/enrollments-EnrollmentService_connectquery"
import { createEnrollment } from "@/gen/courses/v1/enrollments-EnrollmentService_connectquery"
import { getCourseReviewsPaginated } from "@/gen/courses/v1/course_reviews-CourseReviewService_connectquery"
import { CourseLevel } from "@/gen/courses/v1/courses_pb"
import { EnrollmentStatus } from "@/gen/courses/v1/enrollments_pb"
import { uuidToHexString, hexStringToUuid } from "@/utils/uuid"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Users, Star, ArrowLeft, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/modified/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useRouter } from "next/navigation"
import { authClient } from "@/utils/auth-client"
import { useState } from "react"
import { toast } from "sonner"

const levelColors: Record<number, string> = {
	[CourseLevel.BEGINNER]: "bg-green-500/10 text-green-700 dark:text-green-400",
	[CourseLevel.INTERMEDIATE]: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
	[CourseLevel.ADVANCED]: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
}

const levelLabels: Record<number, string> = {
	[CourseLevel.BEGINNER]: "Beginner",
	[CourseLevel.INTERMEDIATE]: "Intermediate",
	[CourseLevel.ADVANCED]: "Advanced",
}

export default function CourseDetailPage() {
	const params = useParams()
	const router = useRouter()
	const courseId = params?.id as string
	const { data: session } = authClient.useSession()
	const [isEnrolling, setIsEnrolling] = useState(false)
	const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({})

	// Convert hex string to bytes for the API
	const courseIdBytes = hexStringToUuid(courseId)

	const { data, isLoading, error } = useQuery(getCourseById, {
		id: courseIdBytes,
	})

	// Check if user is enrolled
	const { data: enrollmentsData } = useQuery(
		getEnrollmentsByUserId,
		{
			statusFilter: EnrollmentStatus.COMPLETED,
		},
		{
			enabled: !!session?.user,
		}
	)

	// Fetch course reviews
	const {
		data: reviewsData,
		isLoading: isLoadingReviews,
		error: reviewsError,
	} = useQuery(
		getCourseReviewsPaginated,
		{
			courseId: courseIdBytes,
			page: 1,
			pageSize: 20,
		},
		{
			enabled: !!data?.course,
		}
	)

	const { mutate: enroll } = useMutation(createEnrollment, {
		onSuccess: (response) => {
			if (response.checkoutUrl) {
				window.location.href = response.checkoutUrl
			} else {
				toast.error("No checkout URL returned")
				setIsEnrolling(false)
			}
		},
		onError: (error) => {
			console.error("Enrollment error:", error)
			toast.error(error instanceof Error ? error.message : "Failed to start enrollment process")
			setIsEnrolling(false)
		},
	})

	// Check if user is enrolled in this course
	const isEnrolled =
		enrollmentsData?.enrollments?.some(
			(enrollment) =>
				uuidToHexString(enrollment.courseId) === courseId &&
				enrollment.status === EnrollmentStatus.COMPLETED
		) || false

	const handleEnroll = () => {
		if (!session?.user) {
			toast.error("Please sign in to enroll")
			router.push("/auth/sign-in")
			return
		}

		setIsEnrolling(true)
		enroll({
			courseId: courseIdBytes,
		})
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">Loading course...</div>
			</div>
		)
	}

	if (error || !data?.course) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center text-destructive">{error?.message || "Course not found"}</div>
				<Button onClick={() => router.back()} className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Go Back
				</Button>
			</div>
		)
	}

	const course = data.course

	// Format duration
	const durationHours = course.duration ? Math.floor(course.duration / 60) : 0
	const durationMinutes = course.duration ? course.duration % 60 : 0
	const durationDisplay =
		durationHours > 0
			? durationMinutes > 0
				? `${durationHours}h ${durationMinutes}m`
				: `${durationHours}h`
			: durationMinutes > 0
				? `${durationMinutes}m`
				: ""

	// Format rating
	const rating = course.averageRating ?? 0
	const ratingDisplay = rating > 0 ? rating.toFixed(1) : "No ratings"

	return (
		<div className="container mx-auto px-4 py-8">
			<Button variant="ghost" onClick={() => router.back()} className="mb-6">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back
			</Button>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content */}
				<div className="lg:col-span-2">
					{/* Course Header */}
					<div className="mb-8">
						<div className="flex items-center gap-2 mb-4">
							{course.categoryIds && course.categoryIds.length > 0 && (
								<Badge variant="outline">{course.categoryIds[0]}</Badge>
							)}
							{course.level !== CourseLevel.UNSPECIFIED && (
								<Badge variant="outline" className={levelColors[course.level] || ""}>
									{levelLabels[course.level] || "Unknown"}
								</Badge>
							)}
						</div>

						<h1 className="text-4xl font-bold mb-4">{course.title}</h1>

						{course.image && (
							<div className="relative w-full h-96 overflow-hidden rounded-lg mb-6">
								<img src={course.image} alt={course.title} className="w-full h-full object-cover" />
							</div>
						)}

						{/* Course Stats */}
						<div className="flex flex-wrap items-center gap-6 mb-6">
							{rating > 0 && (
								<div className="flex items-center gap-2">
									<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
									<span className="font-medium">{ratingDisplay}</span>
									{course.totalReview && course.totalReview > 0 && (
										<span className="text-muted-foreground">({course.totalReview} reviews)</span>
									)}
								</div>
							)}
							{durationDisplay && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="h-5 w-5" />
									<span>{durationDisplay}</span>
								</div>
							)}
							<div className="flex items-center gap-2 text-muted-foreground">
								<BookOpen className="h-5 w-5" />
								<span>{course.numLesson || course.lessons?.length || 0} lessons</span>
							</div>
							{course.totalCustomer && course.totalCustomer > 0 && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Users className="h-5 w-5" />
									<span>{course.totalCustomer} students</span>
								</div>
							)}
						</div>

						{/* Description */}
						{course.description && (
							<div className="prose dark:prose-invert max-w-none mb-8">
								<p className="text-lg text-muted-foreground">{course.description}</p>
							</div>
						)}
					</div>

					{/* Lessons Section - Accordion */}
					{course.lessons && course.lessons.length > 0 && (
						<div className="mb-8">
							<h2 className="text-2xl font-semibold mb-4">Course Lessons</h2>
							<div className="space-y-2">
								{course.lessons.map((lesson, index) => {
									const lessonId = uuidToHexString(lesson.id)
									const isOpen = openLessons[lessonId] || false
									const lessonDurationHours = Math.floor(lesson.duration / 60)
									const lessonDurationMinutes = lesson.duration % 60
									const lessonDurationDisplay =
										lessonDurationHours > 0
											? lessonDurationMinutes > 0
												? `${lessonDurationHours}h ${lessonDurationMinutes}m`
												: `${lessonDurationHours}h`
											: `${lessonDurationMinutes}m`

									return (
										<Collapsible
											key={lessonId}
											open={isOpen}
											onOpenChange={(open) =>
												setOpenLessons((prev) => ({
													...prev,
													[lessonId]: open,
												}))
											}
										>
											<div className="border rounded-lg">
												<CollapsibleTrigger className="w-full">
													<div className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
														<div className="flex items-center gap-3 flex-1 text-left">
															<span className="text-sm font-medium text-muted-foreground">
																Lesson {index + 1}
															</span>
															<h3 className="font-semibold">{lesson.title}</h3>
														</div>
														<div className="flex items-center gap-4">
															<div className="flex items-center gap-1 text-sm text-muted-foreground">
																<Clock className="h-4 w-4" />
																<span>{lessonDurationDisplay}</span>
															</div>
															<ChevronDown
																className={`h-4 w-4 text-muted-foreground transition-transform ${
																	isOpen ? "rotate-180" : ""
																}`}
															/>
														</div>
													</div>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<div className="px-4 pb-4 pt-0">
														{lesson.description && (
															<p className="text-sm text-muted-foreground">{lesson.description}</p>
														)}
													</div>
												</CollapsibleContent>
											</div>
										</Collapsible>
									)
								})}
							</div>
						</div>
					)}

					{/* Reviews Section */}
					<div className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">
							Reviews ({course.totalReview || reviewsData?.total || 0})
						</h2>
						{isLoadingReviews ? (
							<div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
						) : reviewsError ? (
							<div className="text-center py-8 text-muted-foreground">
								Unable to load reviews. Please try again later.
							</div>
						) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
							<div className="space-y-4">
								{reviewsData.reviews.map((review) => {
									const reviewDate = new Date(Number(review.createdAt) * 1000)
									const formattedDate = reviewDate.toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})

									return (
										<div key={uuidToHexString(review.id)} className="border rounded-lg p-4">
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1">
														{Array.from({ length: 5 }).map((_, i) => (
															<Star
																key={i}
																className={`h-4 w-4 ${
																	i < review.rating
																		? "fill-yellow-400 text-yellow-400"
																		: "text-muted-foreground"
																}`}
															/>
														))}
													</div>
													<span className="text-sm font-medium">{review.rating}/5</span>
												</div>
												<span className="text-sm text-muted-foreground">{formattedDate}</span>
											</div>
											{review.comment && (
												<p className="text-sm text-foreground mt-2">{review.comment}</p>
											)}
										</div>
									)
								})}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								No reviews yet. Be the first to review this course!
							</div>
						)}
					</div>
				</div>

				{/* Enroll Card - Right Side */}
				{!isEnrolled && (
					<div className="lg:col-span-1">
						<Card className="sticky top-8">
							<CardHeader>
								<CardTitle>Enroll in this course</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="text-3xl font-bold">${course.price}</div>
								<Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
									{isEnrolling ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : (
										"Enroll Now"
									)}
								</Button>
								<div className="text-sm text-muted-foreground space-y-2">
									<div className="flex items-center gap-2">
										<BookOpen className="h-4 w-4" />
										<span>{course.numLesson || course.lessons?.length || 0} lessons</span>
									</div>
									{durationDisplay && (
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											<span>{durationDisplay} total</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	)
}
