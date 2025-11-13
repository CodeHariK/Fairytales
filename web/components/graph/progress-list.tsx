"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/modified/card"
import { Progress } from "@/components/modified/progress"
import { CardHeaderWithSelect } from "./card-header-with-select"
import { getSubtleEquidistantColors } from "@/lib/utils"

export interface ProgressListItem {
	name: string
	rating: number
	reviews: number
	progress: number
}

export interface ProgressListProps {
	data: ProgressListItem[]
	title: string
	description?: string
	showPeriodSelector?: boolean
}

export function ProgressList({
	data,
	title,
	description,
	showPeriodSelector = false,
}: ProgressListProps) {
	// Generate equidistant colors based on the number of items
	const colors = getSubtleEquidistantColors(data.length)

	return (
		<Card>
			<CardHeaderWithSelect
				title={title}
				description={description || ""}
				showPeriodSelector={showPeriodSelector}
			/>
			<CardContent>
				<div className="space-y-8">
					{data.map((item, index) => (
						<div key={item.name} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium">{item.name}</p>
									<div className="flex items-center gap-1 mt-1">
										<Star
											className="h-3 w-3"
											style={{
												fill: colors[index],
												color: colors[index],
											}}
										/>
										<span className="text-xs font-medium">{item.rating}</span>
										<span className="text-xs text-muted-foreground">({item.reviews} Reviews)</span>
									</div>
								</div>
							</div>
							<div className="space-y-1">
								<Progress
									value={item.progress}
									className="h-2"
									indicatorStyle={{
										backgroundColor: colors[index],
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
