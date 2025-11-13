"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent } from "@/components/modified/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { CardHeaderWithSelect } from "./card-header-with-select"
import { getSubtleEquidistantColors } from "@/lib/utils"

export interface PieChartDataItem {
	[key: string]: string | number
}

export interface PieChartProps {
	data: PieChartDataItem[]
	dataKey: string
	nameKey: string
	title: string
	description?: string
	descriptionTemplate?: string // Template with {total} placeholder
	valueLabel?: string
	innerRadius?: number
	strokeWidth?: number
	chartSize?: string
}

export function PieChartWithLegend({
	data,
	dataKey,
	nameKey,
	title,
	description,
	descriptionTemplate,
	valueLabel,
	innerRadius = 60,
	strokeWidth = 5,
	chartSize = "h-[200px] w-[200px]",
}: PieChartProps) {
	// Generate equidistant colors based on the number of data items
	const colors = getSubtleEquidistantColors(data.length)

	// Prepare chart data with colors
	const chartData = data.map((item, index) => ({
		...item,
		fill: colors[index],
	}))

	// Calculate total
	const total = data.reduce((sum, item) => {
		const value = item[dataKey]
		return sum + (typeof value === "number" ? value : 0)
	}, 0)

	// Build chart config dynamically using equidistant colors
	const chartConfig: ChartConfig = {
		[dataKey]: {
			label: valueLabel || dataKey,
		},
		...data.reduce(
			(acc, item, index) => {
				const name = String(item[nameKey])
				acc[name] = {
					label: name,
					color: colors[index],
				}
				return acc
			},
			{} as Record<string, { label: string; color: string }>
		),
	}

	// Generate description
	let descriptionText = description
	if (!descriptionText && descriptionTemplate) {
		descriptionText = descriptionTemplate.replace("{total}", String(total))
	}
	if (!descriptionText) {
		descriptionText = `Total: ${total}`
	}

	return (
		<Card>
			<CardHeaderWithSelect title={title} description={descriptionText} />
			<CardContent>
				<div className="flex items-center gap-4">
					<ChartContainer config={chartConfig} className={chartSize}>
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
							<Pie
								data={chartData}
								dataKey={dataKey}
								nameKey={nameKey}
								innerRadius={innerRadius}
								strokeWidth={strokeWidth}
							>
								{chartData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.fill} />
								))}
							</Pie>
						</PieChart>
					</ChartContainer>
					<div className="flex flex-col gap-4">
						{data.map((item, index) => {
							const value = item[dataKey]
							const numericValue = typeof value === "number" ? value : 0
							const percentage = total > 0 ? Math.round((numericValue / total) * 100) : 0
							const name = String(item[nameKey])

							return (
								<div key={`${name}-${index}`} className="flex items-center gap-2">
									<div
										className="h-3 w-3 rounded-full"
										style={{
											backgroundColor: colors[index],
										}}
									/>
									<div className="flex-1">
										<p className="text-sm font-medium">{name}</p>
										<p className="text-xs text-muted-foreground">
											{numericValue} {valueLabel || dataKey} ({percentage}%)
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
