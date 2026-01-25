import { Pool, PoolConfig } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/schema/schema"
import { DATABASE_URL } from "./constants"

const connectionString = DATABASE_URL
if (!connectionString) {
	throw new Error("GOOSE_DBSTRING is not set")
}

const poolConfig: PoolConfig = {
	connectionString,
	ssl: { rejectUnauthorized: false },
	// Connection pool settings
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 10000,
	// Prefer IPv4 if IPv6 is causing issues
	// The pg library will try both, but we can add retry logic
}

export const pool = new Pool(poolConfig)

// Add error handling for connection issues
pool.on("error", (err) => {
	console.error("Unexpected error on idle PostgreSQL client", err)
})

// Test connection on startup
async function testConnection() {
	const maxRetries = 3
	let retryInterval = 1000

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			await pool.query("SELECT 1")
			console.log("✅ PostgreSQL connected successfully")
			return true
		} catch (err) {
			const error = err as Error
			console.error(
				`❌ PostgreSQL connection attempt ${attempt}/${maxRetries} failed:`,
				error.message
			)

			if (attempt === maxRetries) {
				console.error("❌ Failed to connect to PostgreSQL after all retries.")
				return false
			}

			// Wait before retry
			await new Promise((resolve) => setTimeout(resolve, retryInterval))
			retryInterval *= 2
		}
	}
	return false
}

// Test connection asynchronously (don't block startup)
if (typeof window === "undefined") {
	testConnection().catch((err) => {
		console.error("Error during PostgreSQL connection test:", err)
	})
}

export const db = drizzle({ client: pool, schema })
