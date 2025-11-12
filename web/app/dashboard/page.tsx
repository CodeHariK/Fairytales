import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AcademyHeader } from "@/components/dashboard/academy-header"
import { Leaderboard } from "@/components/dashboard/leaderboard"
import { SuccessRate } from "@/components/dashboard/success-rate"

import data from "./data.json"

export default function Page() {
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
							<div className="px-4 lg:px-6 space-y-4">
								{/* Large screens: 2:1:1 layout */}
								<div className="hidden 2xl:grid grid-cols-4 gap-4">
									<div className="col-span-2">
										<AcademyHeader />
									</div>
									<SuccessRate />
									<Leaderboard />
								</div>

								{/* Medium and small screens: AcademyHeader full width, then 1:1 row */}
								<div className="2xl:hidden space-y-4">
									<AcademyHeader />
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<SuccessRate />
										<Leaderboard />
									</div>
								</div>
							</div>

							<SectionCards />
							<div className="px-4 lg:px-6">
								<ChartAreaInteractive />
							</div>
							<DataTable data={data} />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
