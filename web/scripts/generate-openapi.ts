import { readdir, readFile, access } from "fs/promises"
import { join, dirname } from "path"
import { writeFile } from "fs/promises"
import { fileURLToPath } from "url"

interface SwaggerSpec {
	swagger: string
	host?: string
	basePath?: string
	info: {
		title: string
		version: string
		description?: string
	}
	tags?: Array<{ name: string }>
	definitions?: Record<string, any>
	paths?: Record<string, any>
	consumes?: string[]
	produces?: string[]
}

async function pathExists(path: string): Promise<boolean> {
	try {
		await access(path)
		return true
	} catch {
		return false
	}
}

async function scanApiRoutes(projectDir: string): Promise<string[]> {
	const routes: string[] = []

	// Check for Pages Router API routes
	const pagesApiDir = join(projectDir, "pages", "api")
	if (await pathExists(pagesApiDir)) {
		const files = await readdir(pagesApiDir, {
			recursive: true,
		})
		for (const file of files) {
			if (file.endsWith(".ts") || file.endsWith(".tsx")) {
				// Skip catch-all routes and openapi.json
				if (file.includes("[[...") || file === "openapi.json.ts") {
					continue
				}

				const routePath = file
					.replace(/\.tsx?$/, "")
					.replace(/\[\.\.\.(\w+)\]/g, "*")
					.replace(/\[(\w+)\]/g, "{$1}")
					.replace(/\/index$/, "")
				routes.push(routePath)
			}
		}
	}

	// Check for App Router API routes
	const appApiDir = join(projectDir, "app", "api")
	if (await pathExists(appApiDir)) {
		const files = await readdir(appApiDir, { recursive: true })
		for (const file of files) {
			if (file.endsWith(".ts") || file.endsWith(".tsx")) {
				// Skip catch-all routes
				if (file.includes("[[...")) {
					continue
				}

				const routePath = file
					.replace(/\.tsx?$/, "")
					.replace(/\[\.\.\.(\w+)\]/g, "*")
					.replace(/\[(\w+)\]/g, "{$1}")
					.replace(/\/route$/, "")
					.replace(/\/index$/, "")

				// Avoid duplicates if both pages/api and app/api exist
				if (!routes.includes(routePath)) {
					routes.push(routePath)
				}
			}
		}
	}

	return routes
}

// Base64-encoded 16-byte zero UUID: 16 bytes of zeros
const ZERO_UUID_BASE64 = "PAAAAAAAAAAAAAAAAAAAAA=="

/**
 * Recursively processes an object to replace empty strings in bytes fields
 * with a base64-encoded 16-byte zero UUID.
 * For repeated bytes fields (arrays), sets example to empty array [].
 */
function replaceEmptyBytesFields(obj: any, parentSchema?: any): any {
	if (obj === null || obj === undefined) {
		return obj
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => replaceEmptyBytesFields(item, parentSchema))
	}

	if (typeof obj === "object") {
		const result: any = {}
		for (const [key, value] of Object.entries(obj)) {
			// Check if this is an array of bytes (repeated bytes field)
			const isRepeatedBytesField =
				typeof value === "object" &&
				value !== null &&
				"type" in value &&
				(value as any).type === "array" &&
				"items" in value &&
				(value as any).items &&
				typeof (value as any).items === "object" &&
				(value as any).items.type === "string" &&
				(value as any).items.format === "byte"

			// Check if this is a schema property with format: "byte" (single bytes field)
			const isBytesField =
				typeof value === "object" &&
				value !== null &&
				"type" in value &&
				(value as any).type === "string" &&
				(value as any).format === "byte"

			// Check if this is an example value and the parent schema indicates bytes
			const isBytesExample =
				key === "example" &&
				typeof value === "string" &&
				value === "" &&
				parentSchema?.format === "byte"

			if (isRepeatedBytesField) {
				// For repeated bytes fields, set array example to empty array
				// Remove example from items since array example takes precedence
				const items = (value as any).items
				const { example: _, ...itemsWithoutExample } = items
				result[key] = {
					...value,
					example: [],
					items: itemsWithoutExample,
				}
			} else if (isBytesField) {
				// If it's a single bytes field schema definition, add example with zero UUID
				result[key] = {
					...value,
					example: ZERO_UUID_BASE64,
				}
			} else if (isBytesExample) {
				// Replace empty example with zero UUID
				result[key] = ZERO_UUID_BASE64
			} else {
				// Recursively process nested objects
				result[key] = replaceEmptyBytesFields(value, isBytesField ? value : parentSchema)
			}
		}
		return result
	}

	// For primitive values, check if it's an empty string in a bytes context
	if (typeof obj === "string" && obj === "" && parentSchema?.format === "byte") {
		return ZERO_UUID_BASE64
	}

	return obj
}

async function loadApidocsSwagger(projectDir: string): Promise<Partial<SwaggerSpec>> {
	try {
		// Generated files are in projectDir/gen (e.g., web/gen) per buf.gen.yaml
		const swaggerPath = join(projectDir, "gen", "apidocs.swagger.json")

		if (!(await pathExists(swaggerPath))) {
			console.warn(`⚠️  apidocs.swagger.json not found at ${swaggerPath}`)
			return {}
		}

		const swaggerContent = await readFile(swaggerPath, "utf-8")
		const swagger: SwaggerSpec = JSON.parse(swaggerContent)

		console.log(`✅ Loaded ${swaggerPath}`)
		if (swagger.paths) {
			console.log(`   Found ${Object.keys(swagger.paths).length} Connect RPC paths`)
		}
		if (swagger.definitions) {
			console.log(`   Found ${Object.keys(swagger.definitions).length} definitions`)
		}

		// Process the swagger spec to replace empty bytes fields
		const processedSwagger = replaceEmptyBytesFields(swagger)

		// Return swagger spec (paths, definitions, tags, consumes, produces)
		return {
			paths: processedSwagger.paths,
			definitions: processedSwagger.definitions,
			tags: processedSwagger.tags,
			consumes: processedSwagger.consumes,
			produces: processedSwagger.produces,
		}
	} catch (error) {
		console.warn(`⚠️  Could not load apidocs.swagger.json:`, error)
		return {}
	}
}

async function generateOpenAPISpec(projectDir: string): Promise<void> {
	console.log(`\n📁 Processing project: ${projectDir}\n`)

	// Scan API routes (both pages/api and app/api)
	const routes = await scanApiRoutes(projectDir)
	console.log(`📋 Found ${routes.length} API routes`)

	// Load Connect RPC specs from apidocs.swagger.json
	const connectRPCSpec = await loadApidocsSwagger(projectDir)

	const spec: SwaggerSpec = {
		swagger: "2.0",
		host: "localhost:3000",
		basePath: "/api",
		info: {
			title: "Fairytales API",
			version: "1.0.0",
			description:
				"Auto-generated API documentation (includes Next.js API routes and Connect RPC services)",
		},
		consumes: connectRPCSpec.consumes || ["application/json"],
		produces: connectRPCSpec.produces || ["application/json"],
		tags: connectRPCSpec.tags,
		paths: {
			...(connectRPCSpec.paths || {}),
		},
		definitions: connectRPCSpec.definitions,
	}

	// Ensure paths is defined
	if (!spec.paths) {
		spec.paths = {}
	}

	// Generate paths for each Next.js API route (Swagger 2.0 format)
	for (const route of routes) {
		if (route === "openapi.json" || route === "connect") continue

		const path = `/${route}`
		spec.paths[path] = {
			get: {
				summary: `${route} endpoint`,
				description: `Auto-generated endpoint for ${route}`,
				responses: {
					"200": {
						description: "Success",
						schema: {
							type: "object",
						},
					},
				},
			},
		}
	}

	// Write the spec to a file
	const outputPath = join(projectDir, "public", "openapi.json")
	await writeFile(outputPath, JSON.stringify(spec, null, 2), "utf-8")
	console.log(`\n✅ Swagger 2.0 spec generated at ${outputPath}`)
	console.log(`📊 Total paths: ${Object.keys(spec.paths).length}`)
	console.log(`   - Next.js API routes: ${routes.length}`)
	console.log(`   - Connect RPC endpoints: ${Object.keys(connectRPCSpec.paths || {}).length}`)
}

// Main execution
async function main() {
	// Get the directory where this script is located (web/scripts/)
	const scriptDir = dirname(fileURLToPath(import.meta.url))
	// Go up one level to get the web project directory
	const defaultProjectDir = dirname(scriptDir)

	// If no argument provided, use the web directory (where the script is located)
	// Otherwise, use the provided argument (when run from outside)
	const projectDir = process.argv[2] || defaultProjectDir

	await generateOpenAPISpec(projectDir)
}

main().catch(console.error)
