"use client"

import { ApiReferenceReact } from "@scalar/api-reference-react"
import "@scalar/api-reference-react/style.css"
import { LayoutDashboard, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Docs",
        url: "/docs",
        icon: FileText,
    },
]

export default function ApiDocs() {
    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center gap-4 border-b px-4 py-3 bg-background">
                <nav className="flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                item.url === "/docs" && "bg-accent text-accent-foreground"
                            )}
                        >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </nav>
            </header>
            <div className="flex-1 overflow-hidden">
                <ApiReferenceReact
                    configuration={{
                        url: "/openapi.json",
                    }}
                />
            </div>
        </div>
    )
}

