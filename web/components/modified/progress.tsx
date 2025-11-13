"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
	indicatorClassName?: string
	indicatorStyle?: React.CSSProperties
}

function Progress({
	className,
	value,
	indicatorClassName,
	indicatorStyle,
	...props
}: ProgressProps) {
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn("bg-muted relative h-2 w-full overflow-hidden rounded-full", className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className={cn(
					"h-full w-full flex-1 transition-all",
					!indicatorStyle?.backgroundColor && "bg-primary",
					indicatorClassName
				)}
				style={{
					transform: `translateX(-${100 - (value || 0)}%)`,
					...indicatorStyle,
				}}
			/>
		</ProgressPrimitive.Root>
	)
}

export { Progress }
