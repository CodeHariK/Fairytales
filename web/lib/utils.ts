import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getEquidistantColors(
	count: number,
	chroma: number = 0.12,
	lightness: number = 0.5
): string[] {
	const colors: string[] = []
	const hueStep = 360 / count

	// Clamp chroma and lightness to valid ranges
	const c = Math.max(0, Math.min(0.4, chroma))
	const l = Math.max(0, Math.min(1, lightness))

	for (let i = 0; i < count; i++) {
		const hue = (i * hueStep) % 360
		colors.push(`oklch(${l} ${c} ${hue})`)
	}

	return colors
}

export function getSubtleEquidistantColors(count: number): string[] {
	return getEquidistantColors(count, 0.08, 0.75)
}

export function getVibrantEquidistantColors(count: number): string[] {
	return getEquidistantColors(count, 0.18, 0.55)
}
