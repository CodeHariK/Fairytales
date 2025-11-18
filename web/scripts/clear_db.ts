import { createClient } from "redis"
import { env } from "../utils/env"
import { pool } from "../utils/pg"

async function clear_db() {
	console.warn(
		"🗑️  Dropping everything in database (tables, foreign keys, sequences, constraints, types)..."
	)

	// Drop the entire schema and recreate (most thorough approach - CASCADE drops everything)
	console.warn(
		"   Dropping schema public CASCADE (drops all tables, foreign keys, sequences, types, etc.)..."
	)
	await pool.query("DROP SCHEMA IF EXISTS public CASCADE;")
	console.warn("   Recreating schema public...")
	await pool.query("CREATE SCHEMA public;")
	await pool.query("GRANT ALL ON SCHEMA public TO public;")

	console.warn("   Dropping schema drizzle CASCADE (if exists)...")
	await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE;")
	console.warn("   Recreating schema drizzle...")
	await pool.query("CREATE SCHEMA drizzle;")
	await pool.query("GRANT ALL ON SCHEMA drizzle TO public;")

	console.log(
		"✅ Database cleared completely! All tables, foreign keys, sequences, and constraints have been dropped."
	)
	await pool.end()
}

clear_db().catch(async (err) => {
	console.error("Drop failed:", err)
	await pool.end()
	process.exit(1)
})

const redisClient = createClient({
	username: env.REDIS_USERNAME,
	password: env.REDIS_PASSWORD,
	socket: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},
})

async function clear_redis() {
	try {
		console.log("Connecting to Redis...")
		await redisClient.connect()
		console.log("✅ Connected to Redis")

		console.log("Clearing Redis cache...")
		await redisClient.flushDb()
		console.log("✅ Redis cache cleared successfully")

		const dbsize = await redisClient.dbSize()
		console.log(`📦 Remaining keys: ${dbsize}`)
	} catch (err) {
		console.error("❌ Failed to clear Redis cache:", err)
		process.exit(1)
	} finally {
		if (redisClient.isOpen) {
			await redisClient.quit()
			console.log("✅ Disconnected from Redis")
		}
	}
}

clear_redis()
