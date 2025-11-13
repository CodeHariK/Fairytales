"use client"

import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/nav/site-header"
import { SidebarInset, SidebarProvider } from "@/components/modified/sidebar"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useMutation } from "@connectrpc/connect-query"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/modified/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/modified/input"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { createCourse } from "@/gen/courses/v1/courses-CourseService_connectquery"
import { createUuidV7 } from "@/utils/uuid"
import { CourseLevel, CourseStatus } from "@/gen/courses/v1/courses_pb"
import { create } from "@bufbuild/protobuf"
import { CreateCourseRequestSchema } from "@/gen/courses/v1/courses_pb"

const formSchema = z.object({
	title: z
		.string()
		.min(3, "Course title must be at least 3 characters.")
		.max(100, "Course title must be at most 100 characters."),
	description: z.string().max(1000, "Description must be at most 1000 characters.").optional(),
	price: z.number().min(0, "Price must be 0 or greater.").optional(),
	image: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
	level: z.nativeEnum(CourseLevel).optional(),
	status: z.nativeEnum(CourseStatus).optional(),
})

export function CreateCourseForm() {
	const router = useRouter()

	const createCourseMutation = useMutation(createCourse, {
		onSuccess: (response) => {
			if (!response.course) {
				toast.error("Course creation failed", {
					description: "No course was returned from the server.",
				})
				return
			}

			toast.success("Course created successfully!", {
				description: `"${response.course.title}" has been created.`,
			})

			// Redirect to course page or dashboard
			router.push("/dashboard")
		},
		onError: (error) => {
			toast.error("Failed to create course", {
				description: error.message || "An unknown error occurred.",
			})
		},
	})

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			price: undefined as number | undefined,
			image: "",
			level: CourseLevel.UNSPECIFIED,
			status: CourseStatus.DRAFT,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = formSchema.safeParse(value)
				if (!result.success) {
					const errors: Record<string, string[]> = {}
					result.error.issues.forEach((issue) => {
						const path = issue.path[0]?.toString() || "root"
						if (!errors[path]) {
							errors[path] = []
						}
						errors[path].push(issue.message)
					})
					return errors
				}
			},
		},
		onSubmit: async ({ value }) => {
			// TODO: Get actual user ID from auth context
			const creatorId = createUuidV7() // Placeholder - replace with actual user ID

			const request = create(CreateCourseRequestSchema, {
				title: value.title,
				description: value.description || undefined,
				categoryIds: [],
				level: value.level !== CourseLevel.UNSPECIFIED ? value.level : undefined,
				lessons: [],
				price: value.price,
				image: value.image || undefined,
				status: value.status !== CourseStatus.UNSPECIFIED ? value.status : undefined,
				creatorId,
			})

			createCourseMutation.mutate(request)
		},
	})

	return (
		<Card className="w-full sm:max-w-2xl">
			<CardHeader>
				<CardTitle>Create Course</CardTitle>
				<CardDescription>Fill in the details to create a new course.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="create-course-form"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<FieldGroup>
						<form.Field
							name="title"
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Course Title</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Introduction to Web Development"
											autoComplete="off"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<form.Field
							name="description"
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
										<InputGroup>
											<InputGroupTextarea
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="A comprehensive course covering the fundamentals of web development..."
												rows={6}
												className="min-h-24 resize-none"
												aria-invalid={isInvalid}
											/>
											<InputGroupAddon align="block-end">
												<InputGroupText className="tabular-nums">
													{field.state.value.length}/1000 characters
												</InputGroupText>
											</InputGroupAddon>
										</InputGroup>
										<FieldDescription>
											Optional. Provide a detailed description of your course.
										</FieldDescription>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="price"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Price ($)</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												value={field.state.value?.toString() || ""}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const val = e.target.value
													field.handleChange(val === "" ? undefined : Number(val))
												}}
												aria-invalid={isInvalid}
												placeholder="0"
												min="0"
												autoComplete="off"
											/>
											<FieldDescription>Optional. Set to 0 for free courses.</FieldDescription>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>
							<form.Field
								name="level"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Difficulty Level</FieldLabel>
											<Select
												value={field.state.value?.toString()}
												onValueChange={(value) => {
													field.handleChange(Number(value) as CourseLevel)
												}}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select level" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={CourseLevel.BEGINNER.toString()}>Beginner</SelectItem>
													<SelectItem value={CourseLevel.INTERMEDIATE.toString()}>
														Intermediate
													</SelectItem>
													<SelectItem value={CourseLevel.ADVANCED.toString()}>Advanced</SelectItem>
												</SelectContent>
											</Select>
											<FieldDescription>Optional. Select the difficulty level.</FieldDescription>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>
						</div>
						<form.Field
							name="image"
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Image URL</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="https://example.com/image.jpg"
											autoComplete="off"
										/>
										<FieldDescription>Optional. URL to the course cover image.</FieldDescription>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<form.Field
							name="status"
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Status</FieldLabel>
										<Select
											value={field.state.value?.toString()}
											onValueChange={(value) => {
												field.handleChange(Number(value) as CourseStatus)
											}}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={CourseStatus.DRAFT.toString()}>Draft</SelectItem>
												<SelectItem value={CourseStatus.ACTIVE.toString()}>Active</SelectItem>
												<SelectItem value={CourseStatus.ARCHIVED.toString()}>Archived</SelectItem>
											</SelectContent>
										</Select>
										<FieldDescription>Default is Draft. You can publish later.</FieldDescription>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button type="submit" form="create-course-form" disabled={createCourseMutation.isPending}>
						{createCourseMutation.isPending ? "Creating..." : "Create Course"}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	)
}

export default function CreateCoursePage() {
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
								<h1 className="text-3xl font-bold mb-6">Create Course</h1>
								<p className="text-muted-foreground mb-6">
									Fill in the details below to create a new course.
								</p>
								<CreateCourseForm />
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
