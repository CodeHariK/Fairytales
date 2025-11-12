"use client"

import { CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface CardHeaderWithSelectProps {
	title: string
	description: string
	showPeriodSelector?: boolean
	defaultValue?: string
}

export function CardHeaderWithSelect({
	title,
	description,
	showPeriodSelector = true,
	defaultValue = "week",
}: CardHeaderWithSelectProps) {
	return (
		<CardHeader>
			<CardTitle>{title}</CardTitle>
			<CardDescription>{description}</CardDescription>
			{showPeriodSelector && (
				<CardAction>
					<Select defaultValue={defaultValue}>
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
			)}
		</CardHeader>
	)
}
