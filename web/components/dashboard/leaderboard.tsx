import { Card, CardContent, CardHeader, CardTitle } from "@/components/modified/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight } from "lucide-react"
import { getSubtleColorFromHash } from "@/lib/utils"

const leaderboardData = [
	{
		rank: 1,
		name: "Liam Smith",
		initials: "LS",
		points: 5000,
	},
	{
		rank: 2,
		name: "Emma Brown",
		initials: "EB",
		points: 4800,
	},
	{
		rank: 3,
		name: "Noah Johnson",
		initials: "NJ",
		points: 4600,
	},
	{
		rank: 4,
		name: "Olivia Davis",
		initials: "OD",
		points: 4400,
	},
]

export function Leaderboard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">Leaderboard</span>
					<ArrowRight className="h-4 w-4" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{leaderboardData.map((student) => (
						<div key={student.rank} className="flex items-center gap-3">
							<span className="text-sm font-medium w-6">{student.rank}.</span>
							<Avatar className="h-8 w-8">
								<AvatarFallback
									style={{
										backgroundColor: getSubtleColorFromHash(student.name),
									}}
								>
									{student.initials}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="text-sm font-medium">{student.name}</p>
							</div>
							<span className="text-sm font-medium">{student.points.toLocaleString()} pts</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
