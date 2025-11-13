"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/modified/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { Star } from "lucide-react"
import { CardHeaderWithSelect } from "@/components/card-header-with-select"

// Example data: rating per year per category
const chartData = [
	{ year: "2021", Design: 3, Marketing: 1, "Web Dev": 3, Business: 5 },
	{ year: "2022", Design: 2, Marketing: 2, "Web Dev": 5, Business: 2 },
	{ year: "2023", Design: 1, Marketing: 3, "Web Dev": 4, Business: 1 },
	{ year: "2024", Design: 4, Marketing: 3, "Web Dev": 2, Business: 1 },
]

const chartConfig = {
	Design: {
		label: "Design",
		color: "var(--chart-1)",
	},
	Marketing: {
		label: "Marketing",
		color: "var(--chart-2)",
	},
	"Web Dev": {
		label: "Web Dev",
		color: "var(--chart-3)",
	},
	Business: {
		label: "Business",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig

export function CourseRating() {
	return (
		<Card>
			<CardHeaderWithSelect title="Course Rating" description="Average ratings by category" />
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[200px] w-full">
					<BarChart data={chartData}>
						<XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
						<YAxis domain={[0, 5]} tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						{/* Stacked bars - use same stackId to stack them */}
						<Bar
							dataKey="Design"
							stackId="rating"
							shape={(props: any) => {
								const { x, y, width, height, ...rest } = props
								return (
									<rect
										x={x}
										y={y}
										width={width}
										height={height}
										fill={chartConfig.Design.color}
										rx={4}
										ry={4}
									/>
								)
							}}
						/>
						<Bar
							dataKey="Marketing"
							stackId="rating"
							shape={(props: any) => {
								const { x, y, width, height, ...rest } = props
								return (
									<rect
										x={x}
										y={y}
										width={width}
										height={height}
										fill={chartConfig.Marketing.color}
										rx={4}
										ry={4}
									/>
								)
							}}
						/>
						<Bar
							dataKey="Web Dev"
							stackId="rating"
							shape={(props: any) => {
								const { x, y, width, height, ...rest } = props
								return (
									<rect
										x={x}
										y={y}
										width={width}
										height={height}
										fill={chartConfig["Web Dev"].color}
										rx={4}
										ry={4}
									/>
								)
							}}
						/>
						<Bar
							dataKey="Business"
							stackId="rating"
							shape={(props: any) => {
								const { x, y, width, height, ...rest } = props
								return (
									<rect
										x={x}
										y={y}
										width={width}
										height={height}
										fill={chartConfig.Business.color}
										rx={4}
										ry={4}
									/>
								)
							}}
						/>
					</BarChart>
				</ChartContainer>
				<div className="mt-4 flex items-center justify-center gap-8">
					{Object.entries(chartConfig).map(([key, config]) => (
						<div key={key} className="flex items-center gap-2">
							<Star className="h-4 w-4" color={config.color} fill={config.color} />
							<span className="text-sm font-medium">{config.label}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
