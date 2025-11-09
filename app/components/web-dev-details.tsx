"use client"

import { Star } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const courses = [
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

export function WebDevDetails() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Web Development Details</CardTitle>
                <CardDescription>Top courses in Web Development</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {courses.map((course) => (
                        <div key={course.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{course.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-medium">{course.rating}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({course.reviews} Reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{course.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ 
                                            width: `${course.progress}%`,
                                            backgroundColor: 'hsl(var(--chart-1))'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

