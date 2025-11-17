"use client"

import { BookOpen, Clock, Users, Loader2, Check } from "lucide-react"
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

	return (
		<Card
			className="relative flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
			style={{
				backgroundImage: course.image ? `url(${course.image})` : undefined,
			}}
		>
			{/* Dark overlay covering entire card */}
			<div className="absolute inset-0 bg-black/60" />

			{/* Content with z-index above overlay */}
			<div className="relative z-10 flex flex-col flex-1">
				<CardHeader>
					<div className="mb-2 flex items-center justify-between">
						<Badge
							variant="outline"
							className={levelColors[course.level as keyof typeof levelColors]}
						>
							{course.level}
						</Badge>
					</div>
					<CardDescription className="text-white/90">{course.category}</CardDescription>

					<CardTitle className="text-lg text-white">{course.title}</CardTitle>

					<p className="text-xs text-white/70 font-mono my-2">{course.id}</p>
				</CardHeader>
				<CardContent className="flex-1 space-y-2">
					<div className="flex items-center gap-4 text-sm text-white/90">
						<div className="flex items-center gap-1">
							<BookOpen className="h-4 w-4" />
							<span>{course.lessons} lessons</span>
						</div>
						<div className="flex items-center gap-1">
							<Clock className="h-4 w-4" />
							<span>{course.hours} hours</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-white/90" />
						<span className="text-sm text-white/90">{course.students}+ students</span>
					</div>
				</CardContent>
				<CardFooter className="flex items-center justify-between">
					<span className="text-lg font-semibold text-white">${course.price}</span>
					<Button
						size="sm"
						onClick={handleEnroll}
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
			</div>
		</Card>
	)
}
