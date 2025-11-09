"use client"

import * as React from "react"
import { BookOpen, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

const courses = [
	{
		id: 1,
		title: "Graphic Design Fundamentals",
		category: "Web Development",
		level: "Beginner",
		lessons: 20,
		hours: 40,
		students: 317,
		price: 99,
		image: "🎨",
	},
	{
		id: 2,
		title: "Digital Marketing Mastery",
		category: "Marketing",
		level: "Intermediate",
		lessons: 18,
		hours: 30,
		students: 277,
		price: 79,
		image: "📊",
	},
	{
		id: 3,
		title: "Business Analytics with Excel",
		category: "Business",
		level: "Intermediate",
		lessons: 22,
		hours: 45,
		students: 300,
		price: 95,
		image: "📈",
	},
	{
		id: 4,
		title: "Python for Beginners",
		category: "Web Development",
		level: "Beginner",
		lessons: 25,
		hours: 50,
		students: 342,
		price: 89,
		image: "🐍",
	},
	{
		id: 5,
		title: "UI/UX Design Basics",
		category: "Web Development",
		level: "Beginner",
		lessons: 20,
		hours: 35,
		students: 290,
		price: 89,
		image: "🎯",
	},
	{
		id: 6,
		title: "Social Media Strategies",
		category: "Marketing",
		level: "Advanced",
		lessons: 24,
		hours: 40,
		students: 254,
		price: 109,
		image: "📱",
	},
	{
		id: 7,
		title: "JavaScript Essentials",
		category: "Web Development",
		level: "Intermediate",
		lessons: 28,
		hours: 60,
		students: 159,
		price: 99,
		image: "⚡",
	},
	{
		id: 8,
		title: "Data Science for Beginners",
		category: "Data Science",
		level: "Beginner",
		lessons: 30,
		hours: 60,
		students: 404,
		price: 129,
		image: "🔬",
	},
]

const levelColors = {
	Beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
	Intermediate: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
	Advanced: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
}

export function CourseGrid() {
	const [filter, setFilter] = React.useState("all")

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<Tabs value={filter} onValueChange={setFilter} className="w-auto">
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="active">Active</TabsTrigger>
						<TabsTrigger value="draft">Draft</TabsTrigger>
						<TabsTrigger value="archived">Archived</TabsTrigger>
					</TabsList>
				</Tabs>
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
			<div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
				{courses.map((course) => (
					<Card key={course.id} className="flex flex-col">
						<CardHeader>
							<div className="mb-2 flex items-center justify-between">
								<Badge
									variant="outline"
									className={levelColors[course.level as keyof typeof levelColors]}
								>
									{course.level}
								</Badge>
								<div className="text-4xl">{course.image}</div>
							</div>
							<CardDescription>{course.category}</CardDescription>
							<CardTitle className="text-lg">{course.title}</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 space-y-2">
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
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
								<Users className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									{course.students}+ students
								</span>
							</div>
						</CardContent>
						<CardFooter className="flex items-center justify-between">
							<span className="text-lg font-semibold">${course.price}</span>
							<Button size="sm">Enroll</Button>
						</CardFooter>
					</Card>
				))}
			</div>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<p className="text-sm text-muted-foreground">Showing 1-8 of 64</p>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" disabled>
						Previous
					</Button>
					<div className="flex items-center gap-1">
						<Button variant="default" size="sm">
							1
						</Button>
						<Button variant="outline" size="sm">
							2
						</Button>
						<Button variant="outline" size="sm">
							3
						</Button>
						<span className="px-2 text-sm text-muted-foreground">...</span>
						<Button variant="outline" size="sm">
							8
						</Button>
					</div>
					<Button variant="outline" size="sm">
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}

