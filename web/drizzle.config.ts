import { defineConfig } from "drizzle-kit"
import { DATABASE_URL } from "./utils/constants"

export default defineConfig({
	out: "./drizzle",
	schema: "./schema/*.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL,
	},
})
