import { readdir, readFile } from "fs/promises"
import { join } from "path"
import { writeFile } from "fs/promises"

interface OpenAPISpec {
	openapi: string
	info: {
		title: string
		version: string
		description: string
	}
	servers: Array<{ url: string; description: string }>
	paths: Record<string, any>
	components?: {
		schemas?: Record<string, any>
	}
}

interface SwaggerSpec {
	swagger: string
	info: {
		title: string
		version: string
	}
	tags?: Array<{ name: string }>
	definitions?: Record<string, any>
	paths?: Record<string, any>
}

async function scanApiRoutes(apiDir: string): Promise<string[]> {
	const routes: string[] = []
	const files = await readdir(apiDir, { recursive: true })

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

	return routes
}

function convertSwaggerToOpenAPI(swagger: SwaggerSpec): Partial<OpenAPISpec> {
	const components: Record<string, any> = {}

	// Convert definitions to components/schemas
	if (swagger.definitions) {
		components.schemas = {}
		for (const [key, value] of Object.entries(swagger.definitions)) {
			components.schemas[key] = value
		}
	}

	return {
		components: Object.keys(components).length > 0 ? components : undefined,
	}
}

async function findSwaggerFiles(genDir: string): Promise<string[]> {
	const swaggerFiles: string[] = []
	const files = await readdir(genDir, { recursive: true })

	for (const file of files) {
		if (file.endsWith(".swagger.json")) {
			swaggerFiles.push(join(genDir, file))
		}
	}

	return swaggerFiles
}

function extractServiceNameFromPath(filePath: string): string {
	// Extract service name from path like gen/connectrpc/eliza/v1/eliza.swagger.json
	const match = filePath.match(/([^/]+)\.swagger\.json$/)
	if (match) {
		return match[1]
	}
	return "Unknown"
}

function generateConnectRPCPaths(
	swagger: SwaggerSpec,
	serviceName: string,
	components: Record<string, any>,
	swaggerPath: string,
): Record<string, any> {
	const paths: Record<string, any> = {}

	// Extract package name from swagger file path
	// Path format: gen/connectrpc/eliza/v1/eliza.swagger.json
	// We need: connectrpc.eliza.v1 (without "gen" and filename)
	const pathParts = swaggerPath.split("/")
	
	// Find the index of "gen" directory
	const genIndex = pathParts.findIndex((p) => p === "gen")
	
	// Extract package parts: everything after "gen" except the filename
	const packageParts = genIndex >= 0 
		? pathParts.slice(genIndex + 1, -1) // Remove "gen" and filename (last part)
		: pathParts.slice(0, -1) // Remove filename if no "gen" found
	
	const packageName = packageParts.join(".")
	const serviceTag = swagger.tags?.[0]?.name || serviceName

	// Generate paths for each RPC method based on service definition
	// This is a simplified approach - in a real scenario, you'd parse the proto file
	// For now, we'll generate paths based on common patterns

	// If the swagger has tags, it likely has service definitions
	if (swagger.tags && swagger.tags.length > 0) {
		// Common RPC methods for ElizaService
		const rpcMethods = [
			{
				name: "Say",
				path: `${packageName}.${serviceTag}/Say`,
				summary: "Say - Unary RPC",
				description: "Send a sentence and get a response",
				requestSchema: {
					type: "object",
					properties: {
						sentence: { type: "string" },
					},
				},
				responseSchema: components.schemas?.v1SayResponse || {
					type: "object",
					properties: {
						sentence: { type: "string" },
					},
				},
			},
			{
				name: "Introduce",
				path: `${packageName}.${serviceTag}/Introduce`,
				summary: "Introduce - Server Streaming RPC",
				description: "Get an introduction from Eliza",
				requestSchema: {
					type: "object",
					properties: {
						name: { type: "string" },
					},
				},
				responseSchema: components.schemas?.v1IntroduceResponse || {
					type: "object",
					properties: {
						sentence: { type: "string" },
					},
				},
			},
			{
				name: "Converse",
				path: `${packageName}.${serviceTag}/Converse`,
				summary: "Converse - Bidirectional Streaming RPC",
				description: "Have a bidirectional conversation with Eliza",
				requestSchema: {
					type: "object",
					properties: {
						sentence: { type: "string" },
					},
				},
				responseSchema: components.schemas?.v1ConverseResponse || {
					type: "object",
					properties: {
						sentence: { type: "string" },
					},
				},
			},
		]

		for (const method of rpcMethods) {
			paths[`/${method.path}`] = {
				post: {
					summary: method.summary,
					description: method.description,
					tags: [serviceTag],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: method.requestSchema,
							},
						},
					},
					responses: {
						"200": {
							description: "Success",
							content: {
								"application/json": {
									schema: method.responseSchema,
								},
							},
						},
					},
				},
			}
		}
	}

	return paths
}

async function loadConnectRPCSpecs(): Promise<Partial<OpenAPISpec>> {
	try {
		const genDir = join(process.cwd(), "gen")
		const swaggerFiles = await findSwaggerFiles(genDir)

		if (swaggerFiles.length === 0) {
			console.warn("⚠️  No swagger.json files found in gen directory")
			return {}
		}

		const allPaths: Record<string, any> = {}
		const allComponents: Record<string, any> = { schemas: {} }

		for (const swaggerPath of swaggerFiles) {
			const swaggerContent = await readFile(swaggerPath, "utf-8")
			const swagger: SwaggerSpec = JSON.parse(swaggerContent)

			// Skip swagger files without services (empty paths and no tags)
			if (!swagger.tags || swagger.tags.length === 0) {
				console.log(`⏭️  Skipping ${swaggerPath} (no service definitions)`)
				// Still include definitions for schemas
				if (swagger.definitions) {
					for (const [key, value] of Object.entries(swagger.definitions)) {
						allComponents.schemas[key] = value
					}
				}
				continue
			}

			const openAPI = convertSwaggerToOpenAPI(swagger)
			const serviceName = extractServiceNameFromPath(swaggerPath)

			// Merge components
			if (openAPI.components?.schemas) {
				Object.assign(allComponents.schemas, openAPI.components.schemas)
			}

			// Generate paths for this service
			const servicePaths = generateConnectRPCPaths(
				swagger,
				serviceName,
				openAPI.components || {},
				swaggerPath,
			)
			Object.assign(allPaths, servicePaths)

			console.log(`✅ Loaded ${swaggerPath} (${Object.keys(servicePaths).length} paths)`)
		}

		return {
			components: Object.keys(allComponents.schemas).length > 0 ? allComponents : undefined,
			paths: allPaths,
		}
	} catch (error) {
		console.warn("⚠️  Could not load Connect RPC swagger specs:", error)
		return {}
	}
}

async function generateOpenAPISpec(): Promise<void> {
	const apiDir = join(process.cwd(), "pages", "api")
	const routes = await scanApiRoutes(apiDir)

	// Load Connect RPC specs (all swagger.json files)
	const connectRPCSpec = await loadConnectRPCSpecs()

	const spec: OpenAPISpec = {
		openapi: "3.1.0",
		info: {
			title: "Fairytales API",
			version: "1.0.0",
			description:
				"Auto-generated API documentation for Fairytales Next.js application (includes Next.js API routes and Connect RPC services)",
		},
		servers: [
			{
				url: "/api",
				description: "API Server",
			},
		],
		paths: {
			...(connectRPCSpec.paths || {}),
		},
		components: connectRPCSpec.components,
	}

	// Generate paths for each Next.js API route
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
						content: {
							"application/json": {
								schema: {
									type: "object",
								},
							},
						},
					},
				},
			},
		}
	}

	// Write the spec to a file
	const outputPath = join(process.cwd(), "public", "openapi.json")
	await writeFile(outputPath, JSON.stringify(spec, null, 2), "utf-8")
	console.log(`✅ OpenAPI spec generated at ${outputPath}`)
	console.log(`📋 Found ${routes.length} Next.js API routes`)
	console.log(`📋 Added ${Object.keys(connectRPCSpec.paths || {}).length} Connect RPC endpoints`)
}

generateOpenAPISpec().catch(console.error)
