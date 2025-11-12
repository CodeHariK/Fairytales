"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, CheckCircle2 } from "lucide-react"

export function SuccessRate() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Student Overall Success Rate</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-3xl font-bold">88%</span>
							<div
								className="flex items-center gap-1 text-sm"
								style={{
									color: "var(--chart-2)",
								}}
							>
								<TrendingUp className="h-4 w-4" />
								<span>3%</span>
							</div>
						</div>
						<div className="text-sm text-muted-foreground mb-2">Previous: 85% Target: 100%</div>
						<Progress value={88} className="h-2" indicatorClassName="bg-[var(--chart-1)]" />
					</div>
					<div className="pt-4 border-t space-y-3">
						<div className="flex items-center gap-4 w-full">
							<div className="flex items-center gap-2 flex-1">
								<Users className="h-4 w-4 text-muted-foreground" />
								<div className="flex-1">
									<div className="text-sm font-medium">Total Students</div>
									<div className="text-2xl font-bold">1500</div>
								</div>
							</div>
							<div className="flex items-center gap-2 flex-1">
								<CheckCircle2
									className="h-4 w-4"
									style={{
										color: "var(--chart-2)",
									}}
								/>
								<div className="flex-1">
									<div className="text-sm text-muted-foreground">Passing Students</div>
									<div className="text-xl font-bold">1320</div>
								</div>
							</div>
						</div>
						<div className="text-xs text-muted-foreground">88.0% of total</div>
						<Progress value={88} className="h-2" indicatorClassName="bg-[var(--chart-2)]" />
						<Button variant="outline" className="w-full">
							View Details
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
