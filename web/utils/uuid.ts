import { parse, stringify, v7 as uuidv7 } from "uuid"

/**
 * Converts a UUID Uint8Array (16 bytes) to a UUID string representation.
 * @param uuid - The UUID as a Uint8Array (16 bytes)
 * @returns A UUID string representation (e.g., "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b")
 */
export function uuidToHexString(uuid: Uint8Array): string {
	return stringify(uuid)
}

/**
 * Converts a UUID string to a Uint8Array.
 * @param uuidString - A UUID string (e.g., "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b")
 * @returns The UUID as a Uint8Array (16 bytes)
 * @throws Error if the UUID string is invalid
 */
export function hexStringToUuid(uuidString: string): Uint8Array {
	return parse(uuidString)
}

/**
 * Creates a UUID from a UUID string.
 * @param uuidString - A UUID string (e.g., "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b")
 * @returns The UUID as a Uint8Array (16 bytes)
 */
export function createUuidFromString(uuidString: string): Uint8Array {
	return parse(uuidString)
}

/**
 * Generates a new UUID v7 (timestamp-based).
 * UUID v7 includes a timestamp component, making it sortable by creation time.
 * @returns The UUID as a Uint8Array (16 bytes)
 */
export function createUuidV7(): Uint8Array {
	const uuidString = uuidv7()
	return parse(uuidString)
}
