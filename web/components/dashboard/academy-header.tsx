import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AcademyHeader() {
	return (
		<Card
			className="h-full"
			style={{
				backgroundImage: "url('https://shadcnuikit.com/star-shape.png')",
				backgroundSize: "contain",
			}}
		>
			<CardContent className="h-full">
				<div className="grid grid-cols-1 md:grid-cols-3 items-center h-full pt-6 gap-4">
					<div className="md:col-span-2">
						<div className="mb-2">
							<h1 className="text-3xl font-bold tracking-tight">Hi, Andrew 👋</h1>
						</div>
						<div className="mb-6">
							<p className="text-muted-foreground">
								What do you want to learn today with your partner?
							</p>
						</div>
						<div className="mb-6">
							<p className="text-muted-foreground">
								Discover courses, track progress, and achieve your learning goals seamlessly.
							</p>
						</div>
						<div className="mb-6">
							<Button>Explorer Course</Button>
						</div>
					</div>

					<div className="md:col-span-1 flex items-center justify-center">
						<img
							src="https://shadcnuikit.com/academy-dashboard-dark.svg"
							className="h-full max-h-64 w-auto object-contain"
							alt="Academy illustration"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
