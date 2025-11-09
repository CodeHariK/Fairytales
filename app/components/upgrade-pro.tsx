"use client"

import { Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function UpgradePro() {
    return (
        <Card className="bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 border-yellow-400/30 m-4">
            <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-yellow-400/20">
                            <Rocket className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
                            <p className="text-xs text-muted-foreground">
                                Unlock premium features & enhance your LMS experience!
                            </p>
                        </div>
                    </div>
                    <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                        Upgrade Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

