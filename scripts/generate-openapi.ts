import { readdir, readFile, access } from "fs/promises"
import { join } from "path"
import { writeFile } from "fs/promises"

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
		const files = await readdir(pagesApiDir, { recursive: true })
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

		// Return swagger spec as-is (paths, definitions, tags, consumes, produces)
		return {
			paths: swagger.paths,
			definitions: swagger.definitions,
			tags: swagger.tags,
			consumes: swagger.consumes,
			produces: swagger.produces,
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
	// If no argument provided, use current working directory (when run from within project)
	// Otherwise, use the provided argument (when run from outside)
	const projectDir = process.argv[2] || process.cwd()

	await generateOpenAPISpec(projectDir)
}

main().catch(console.error)
