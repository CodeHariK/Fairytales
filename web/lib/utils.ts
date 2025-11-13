import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getColorFromHash(
	str: string,
	saturation: number = 70,
	lightness: number = 50
): string {
	// Simple hash function to convert string to number
	let hash = 1
	for (let i = 0; i < str.length; i++) {
		hash *= str.charCodeAt(i)
	}

	// Map hash to hue range (0-360)
	const hue = Math.abs(hash) % 360

	// Clamp saturation and lightness to valid ranges
	const sat = Math.max(0, Math.min(100, saturation))
	const light = Math.max(0, Math.min(100, lightness))

	return `hsl(${hue}, ${sat}%, ${light}%)`
}

export function getVibrantColorFromHash(str: string): string {
	return getColorFromHash(str, 75, 55)
}

export function getSubtleColorFromHash(str: string): string {
	return getColorFromHash(str, 64, 88)
}
