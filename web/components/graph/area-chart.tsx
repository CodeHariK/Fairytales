"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/modified/card"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getSubtleEquidistantColors } from "@/lib/utils"

export interface AreaChartDataItem {
	[key: string]: string | number
}

export interface AreaChartProps {
	data: AreaChartDataItem[]
	seriesKeys: string[]
	xAxisKey?: string
	title: string
	description?: string
	timeRangeOptions?: {
		enabled?: boolean
		defaultValue?: string
		options?: Array<{ value: string; label: string; days: number }>
	}
	chartHeight?: string
	stackId?: string
}

export function AreaChartInteractive({
	data,
	seriesKeys,
	xAxisKey = "date",
	title,
	description,
	timeRangeOptions = {
		enabled: true,
		defaultValue: "90d",
		options: [
			{ value: "90d", label: "Last 3 months", days: 90 },
			{ value: "30d", label: "Last 30 days", days: 30 },
			{ value: "7d", label: "Last 7 days", days: 7 },
		],
	},
	chartHeight = "h-[250px]",
	stackId = "a",
}: AreaChartProps) {
	const isMobile = useIsMobile()
	const [timeRange, setTimeRange] = React.useState(timeRangeOptions.defaultValue || "90d")

	// Generate equidistant colors based on the number of series
	const colors = React.useMemo(
		() => getSubtleEquidistantColors(seriesKeys.length),
		[seriesKeys.length]
	)

	// Build chart config dynamically using equidistant colors
	const chartConfig: ChartConfig = React.useMemo(
		() =>
			seriesKeys.reduce(
				(acc, key, index) => {
					acc[key] = {
						label: key.charAt(0).toUpperCase() + key.slice(1),
						color: colors[index],
					}
					return acc
				},
				{} as Record<string, { label: string; color: string }>
			),
		[seriesKeys, colors]
	)

	React.useEffect(() => {
		if (isMobile && timeRangeOptions.enabled) {
			setTimeRange("7d")
		}
	}, [isMobile, timeRangeOptions.enabled])

	const filteredData = React.useMemo(() => {
		if (!timeRangeOptions.enabled) return data

		const option = timeRangeOptions.options?.find((opt) => opt.value === timeRange)
		if (!option) return data

		// Find the latest date in the data
		const dates = data.map((item) => new Date(String(item[xAxisKey])))
		const referenceDate = new Date(Math.max(...dates.map((d) => d.getTime())))

		const startDate = new Date(referenceDate)
		startDate.setDate(startDate.getDate() - option.days)

		return data.filter((item) => {
			const date = new Date(String(item[xAxisKey]))
			return date >= startDate
		})
	}, [data, timeRange, xAxisKey, timeRangeOptions])

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && (
					<CardDescription>
						<span className="hidden @[540px]/card:block">{description}</span>
						<span className="@[540px]/card:hidden">{description}</span>
					</CardDescription>
				)}
				{timeRangeOptions.enabled && (
					<CardAction>
						<ToggleGroup
							type="single"
							value={timeRange}
							onValueChange={setTimeRange}
							variant="outline"
							className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
						>
							{timeRangeOptions.options?.map((option) => (
								<ToggleGroupItem key={option.value} value={option.value}>
									{option.label}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
						<Select value={timeRange} onValueChange={setTimeRange}>
							<SelectTrigger
								className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
								size="sm"
								aria-label="Select a value"
							>
								<SelectValue placeholder={timeRangeOptions.options?.[0]?.label} />
							</SelectTrigger>
							<SelectContent className="rounded-xl">
								{timeRangeOptions.options?.map((option) => (
									<SelectItem key={option.value} value={option.value} className="rounded-lg">
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardAction>
				)}
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer config={chartConfig} className={`aspect-auto ${chartHeight} w-full`}>
					<AreaChart data={filteredData}>
						<defs>
							{seriesKeys.map((key, index) => (
								<linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={colors[index]} stopOpacity={1.0} />
									<stop offset="95%" stopColor={colors[index]} stopOpacity={0.1} />
								</linearGradient>
							))}
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey={xAxisKey}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(String(value))
								return date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})
							}}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => {
										return new Date(String(value)).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})
									}}
									indicator="dot"
								/>
							}
						/>
						{seriesKeys.map((key, index) => (
							<Area
								key={key}
								dataKey={key}
								type="natural"
								fill={`url(#fill${key})`}
								stroke={colors[index]}
								stackId={stackId}
							/>
						))}
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
