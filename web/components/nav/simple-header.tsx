"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/new/theme-switcher"
import { useRouter } from "next/navigation"

export function SimpleHeader() {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
			<div className="flex w-full items-center gap-4">
				<Link href="/" className="flex items-center gap-2">
					<div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-400 text-white font-bold text-xs">
						C
					</div>
					<span className="text-base font-semibold">Fairytales</span>
				</Link>

				<div className="ml-auto">
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	)
}
