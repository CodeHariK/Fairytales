"use client"

import * as React from "react"
import { Bar, BarChart, XAxis } from "recharts"
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
import { Star } from "lucide-react"

const chartData = [
    { category: "Design", rating: 4.7 },
    { category: "Marketing", rating: 4.8 },
    { category: "Web Dev...", rating: 4.6 },
    { category: "Business", rating: 4.8 },
]

const chartConfig = {
    rating: {
        label: "Rating",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function CourseRating() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Rating</CardTitle>
                <CardDescription>Average ratings by category</CardDescription>
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
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="rating" fill="hsl(var(--chart-1))" radius={4} />
                    </BarChart>
                </ChartContainer>
                <div className="mt-4 flex items-center justify-center gap-4">
                    {chartData.map((item) => (
                        <div key={item.category} className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-0.5">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{item.rating}/5</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

