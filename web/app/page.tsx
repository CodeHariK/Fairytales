import { AppSidebar } from "@/components/nav/app-sidebar"
import { PieChartWithLegend } from "@/components/graph/pie-chart"
import { StackedChart } from "@/components/graph/stack-chart"
import { ProgressList } from "@/components/graph/progress-list"
import { CourseGrid } from "@/components/course-grid"
import { SiteHeader } from "@/components/nav/site-header"
import { SidebarInset, SidebarProvider } from "@/components/modified/sidebar"

const baseData = [
	{ category: "Design", courses: 80 },
	{ category: "Marketing", courses: 60 },
	{ category: "Web Development", courses: 55 },
	{ category: "Business", courses: 55 },
]

const chartData = [
	{ year: "2021", Design: 3, Marketing: 1, "Web Dev": 3, Business: 5 },
	{ year: "2022", Design: 2, Marketing: 2, "Web Dev": 5, Business: 2 },
	{ year: "2023", Design: 1, Marketing: 3, "Web Dev": 4, Business: 1 },
	{ year: "2024", Design: 4, Marketing: 3, "Web Dev": 2, Business: 1 },
]

const coursesData = [
	{
		name: "Python for Beginners",
		rating: 4.8,
		reviews: 1400,
		progress: 75,
	},
	{
		name: "JavaScript Essentials",
		rating: 4.7,
		reviews: 1100,
		progress: 60,
	},
	{
		name: "Full-Stack Web Development",
		rating: 4.6,
		reviews: 950,
		progress: 45,
	},
	{
		name: "React & Frontend Frameworks",
		rating: 4.5,
		reviews: 820,
		progress: 30,
	},
]

export default function Home() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="grid grid-cols-1 gap-4 px-4 2xl:grid-cols-3 2xl:px-6">
								<PieChartWithLegend
									data={baseData}
									dataKey="courses"
									nameKey="category"
									title="Courses by Category"
									descriptionTemplate="Total Course {total}"
									valueLabel="Courses"
								/>

								<StackedChart
									data={chartData}
									xAxisKey="year"
									title="Course Rating"
									description="Average ratings by category"
									yAxisDomain={[0, 5]}
								/>

								<ProgressList
									data={coursesData}
									title="Web Development Details"
									description="Top courses in Web Development"
									showPeriodSelector={false}
								/>
							</div>
							<CourseGrid />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
