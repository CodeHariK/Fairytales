"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const chartData = [
    { category: "Design", courses: 80, fill: "hsl(var(--chart-1))" },
    { category: "Marketing", courses: 60, fill: "hsl(var(--chart-2))" },
    { category: "Web Development", courses: 55, fill: "hsl(var(--chart-3))" },
    { category: "Business", courses: 55, fill: "hsl(var(--chart-4))" },
]

const chartConfig = {
    courses: {
        label: "Courses",
    },
    Design: {
        label: "Design",
        color: "hsl(var(--chart-1))",
    },
    Marketing: {
        label: "Marketing",
        color: "hsl(var(--chart-2))",
    },
    "Web Development": {
        label: "Web Development",
        color: "hsl(var(--chart-3))",
    },
    Business: {
        label: "Business",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig

export function CoursesByCategory() {
    const totalCourses = chartData.reduce((sum, item) => sum + item.courses, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Courses by Category</CardTitle>
                <CardDescription>Total Course {totalCourses}</CardDescription>
                <CardAction>
                    <Select defaultValue="week">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                        <PieChart>
                            <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                                cursor={false}
                            />
                            <Pie
                                data={chartData}
                                dataKey="courses"
                                nameKey="category"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <div className="flex flex-col gap-4">
                        {chartData.map((item) => (
                            <div key={item.category} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.category}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.courses} Courses (
                                        {Math.round((item.courses / totalCourses) * 100)}%)
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

