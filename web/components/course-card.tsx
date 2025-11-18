"use client"

import { BookOpen, Clock, Users, Loader2, Check, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/modified/card"
import { authClient } from "@/utils/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMutation } from "@connectrpc/connect-query"
import { createEnrollment } from "@/gen/courses/v1/enrollments-EnrollmentService_connectquery"
import { hexStringToUuid } from "@/utils/uuid"

export type CourseLevelDisplay = "Beginner" | "Intermediate" | "Advanced"

export interface Course {
	id: string
	title: string
	category: string
	level: CourseLevelDisplay
	lessons: number
	hours: number
	students: number
	price: number
	image: string
	averageRating?: number
	totalReview?: number
	duration?: number // Duration in minutes
	isEnrolled?: boolean
}

const levelColors: Record<CourseLevelDisplay, string> = {
	Beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
	Intermediate: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
	Advanced: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
}

interface CourseCardProps {
	course: Course
}

export function CourseCard({ course }: CourseCardProps) {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	const { data: session } = authClient.useSession()

	const { mutate: enroll, isPending: isEnrolling } = useMutation(createEnrollment, {
		onSuccess: (response) => {
			if (response.checkoutUrl) {
				window.location.href = response.checkoutUrl
			} else {
				toast.error("No checkout URL returned")
				setIsLoading(false)
			}
		},
		onError: (error) => {
			console.error("Enrollment error:", error)
			toast.error(error instanceof Error ? error.message : "Failed to start enrollment process")
			setIsLoading(false)
		},
	})

	const handleEnroll = async () => {
		if (!session?.user) {
			toast.error("Please sign in to enroll")
			router.push("/auth/sign-in")
			return
		}

		if (course.isEnrolled) {
			router.push(`/courses/${course.id}`)
			return
		}

		setIsLoading(true)
		enroll({
			courseId: hexStringToUuid(course.id),
		})
	}

	// Calculate duration display
	const durationHours = course.duration ? Math.round(course.duration / 60) : course.hours || 0
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

	const handleCardClick = () => {
		router.push(`/course/${course.id}`)
	}

	return (
		<Card
			className="flex flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
			onClick={handleCardClick}
		>
			<CardHeader>
				<div className="mb-2 flex items-center justify-between">
					<Badge
						variant="outline"
						className={levelColors[course.level as keyof typeof levelColors]}
					>
						{course.level}
					</Badge>
				</div>
				<CardDescription className="text-muted-foreground">{course.category}</CardDescription>
				<CardTitle className="text-lg">{course.title}</CardTitle>
			</CardHeader>

			{/* Image section - separate between title and info */}
			{course.image && (
				<div className="relative w-full h-48 overflow-hidden">
					<img src={course.image} alt={course.title} className="w-full h-full object-cover" />
				</div>
			)}

			<CardContent className="flex-1 space-y-3">
				{/* Rating and Duration */}
				<div className="flex items-center gap-4 text-sm">
					{rating > 0 && (
						<div className="flex items-center gap-1">
							<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
							<span className="font-medium">{ratingDisplay}</span>
							{course.totalReview && course.totalReview > 0 && (
								<span className="text-muted-foreground">({course.totalReview})</span>
							)}
						</div>
					)}
					{durationDisplay && (
						<div className="flex items-center gap-1 text-muted-foreground">
							<Clock className="h-4 w-4" />
							<span>{durationDisplay}</span>
						</div>
					)}
				</div>

				{/* Other info */}
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<BookOpen className="h-4 w-4" />
						<span>{course.lessons} lessons</span>
					</div>
					{course.students > 0 && (
						<div className="flex items-center gap-1">
							<Users className="h-4 w-4" />
							<span>{course.students}+ students</span>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="flex items-center justify-between">
				<span className="text-lg font-semibold">${course.price}</span>
				<Button
					size="sm"
					onClick={(e) => {
						e.stopPropagation() // Prevent card click when clicking button
						handleEnroll()
					}}
					disabled={isLoading || isEnrolling}
					variant={course.isEnrolled ? "secondary" : "default"}
				>
					{isLoading || isEnrolling ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Processing...
						</>
					) : course.isEnrolled ? (
						<>
							<Check className="mr-2 h-4 w-4" />
							Enrolled
						</>
					) : (
						"Enroll"
					)}
				</Button>
			</CardFooter>
		</Card>
	)
}
