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
import { CardHeaderWithSelect } from "./card-header-with-select"
import { getSubtleEquidistantColors } from "@/lib/utils"

export interface StackedChartDataItem {
	[key: string]: string | number
}

export interface StackedChartProps {
	data: StackedChartDataItem[]
	xAxisKey: string
	title: string
	description?: string
	stackId?: string
	yAxisDomain?: [number, number]
	chartHeight?: string
	showLegend?: boolean
}

export function StackedChart({
	data,
	xAxisKey,
	title,
	description,
	stackId = "stack",
	yAxisDomain = [0, 5],
	chartHeight = "h-[200px]",
	showLegend = true,
}: StackedChartProps) {
	// Extract category keys (excluding xAxisKey)
	const categories = React.useMemo(() => {
		if (data.length === 0) return []
		return Object.keys(data[0]).filter((key) => key !== xAxisKey)
	}, [data, xAxisKey])

	// Generate equidistant colors
	const colors = React.useMemo(
		() => getSubtleEquidistantColors(categories.length),
		[categories.length]
	)

	// Build chart config dynamically using equidistant colors
	const chartConfig: ChartConfig = React.useMemo(
		() =>
			categories.reduce(
				(acc, category, index) => {
					acc[category] = {
						label: category,
						color: colors[index],
					}
					return acc
				},
				{} as Record<string, { label: string; color: string }>
			),
		[categories, colors]
	)

	return (
		<Card>
			<CardHeaderWithSelect title={title} description={description || ""} />
			<CardContent>
				<ChartContainer config={chartConfig} className={`${chartHeight} w-full`}>
					<BarChart data={data}>
						<XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
						<YAxis domain={yAxisDomain} tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						{/* Stacked bars - use same stackId to stack them */}
						{categories.map((category) => (
							<Bar
								key={category}
								dataKey={category}
								stackId={stackId}
								shape={(props: any) => {
									const { x, y, width, height } = props
									return (
										<rect
											x={x}
											y={y}
											width={width}
											height={height}
											fill={chartConfig[category].color}
											rx={4}
											ry={4}
										/>
									)
								}}
							/>
						))}
					</BarChart>
				</ChartContainer>
				{showLegend && (
					<div className="mt-4 flex items-center justify-center gap-8">
						{Object.entries(chartConfig).map(([key, config]) => (
							<div key={key} className="flex items-center gap-2">
								<Star className="h-4 w-4" color={config.color} fill={config.color} />
								<span className="text-sm font-medium">{config.label}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
