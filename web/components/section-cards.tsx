import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
	description: string
	value: string
	trend: {
		icon: LucideIcon
		value: string
	}
	footer: {
		title: string
		description: string
	}
}

function StatCard({ description, value, trend, footer }: StatCardProps) {
	const TrendIcon = trend.icon
	return (
		<Card className="@container/card">
			<CardHeader>
				<CardDescription>{description}</CardDescription>
				<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
					{value}
				</CardTitle>
				<CardAction>
					<Badge variant="outline">
						<TrendIcon />
						{trend.value}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					{footer.title} <TrendIcon className="size-4" />
				</div>
				<div className="text-muted-foreground">{footer.description}</div>
			</CardFooter>
		</Card>
	)
}

export function SectionCards() {
	const cards = [
		{
			description: "Total Revenue",
			value: "$1,250.00",
			trend: {
				icon: TrendingUp,
				value: "+12.5%",
			},
			footer: {
				title: "Trending up this month",
				description: "Visitors for the last 6 months",
			},
		},
		{
			description: "New Customers",
			value: "1,234",
			trend: {
				icon: TrendingDown,
				value: "-20%",
			},
			footer: {
				title: "Down 20% this period",
				description: "Acquisition needs attention",
			},
		},
		{
			description: "Active Accounts",
			value: "45,678",
			trend: {
				icon: TrendingUp,
				value: "+12.5%",
			},
			footer: {
				title: "Strong user retention",
				description: "Engagement exceed targets",
			},
		},
		{
			description: "Growth Rate",
			value: "4.5%",
			trend: {
				icon: TrendingUp,
				value: "+4.5%",
			},
			footer: {
				title: "Steady performance increase",
				description: "Meets growth projections",
			},
		},
	]

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{cards.map((card) => (
				<StatCard key={card.description} {...card} />
			))}
		</div>
	)
}
