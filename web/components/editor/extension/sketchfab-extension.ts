import { Node, mergeAttributes } from "@tiptap/core"

export interface SketchfabOptions {
	HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		sketchfab: {
			/**
			 * Insert a Sketchfab embed
			 */
			setSketchfab: (options: {
				url: string
				title?: string
				width?: string
				height?: string
			}) => ReturnType
		}
	}
}

/**
 * Sketchfab extension for TipTap
 * Allows embedding Sketchfab 3D models via iframe
 */
export const Sketchfab = Node.create<SketchfabOptions>({
	name: "sketchfab",

	group: "block",

	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		}
	},

	addAttributes() {
		return {
			url: {
				default: null,
				parseHTML: (element) => {
					const iframe = element.querySelector("iframe")
					return iframe?.getAttribute("src") || null
				},
				renderHTML: (attributes) => {
					if (!attributes.url) {
						return {}
					}
					return {
						"data-url": attributes.url,
					}
				},
			},
			title: {
				default: null,
				parseHTML: (element) => {
					const iframe = element.querySelector("iframe")
					return iframe?.getAttribute("title") || null
				},
				renderHTML: (attributes) => {
					return {
						"data-title": attributes.title,
					}
				},
			},
			width: {
				default: "100%",
				parseHTML: (element) => {
					const iframe = element.querySelector("iframe")
					return iframe?.getAttribute("width") || "100%"
				},
				renderHTML: (attributes) => {
					return {
						"data-width": attributes.width,
					}
				},
			},
			height: {
				default: "480",
				parseHTML: (element) => {
					const iframe = element.querySelector("iframe")
					return iframe?.getAttribute("height") || "480"
				},
				renderHTML: (attributes) => {
					return {
						"data-height": attributes.height,
					}
				},
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="sketchfab"]',
			},
		]
	},

	renderHTML({ HTMLAttributes, node }) {
		const { url, title, width, height } = node.attrs

		if (!url) {
			return [
				"div",
				mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "sketchfab" }),
				"Invalid Sketchfab URL",
			]
		}

		// Ensure URL is a Sketchfab embed URL
		let embedUrl = url.trim()

		// If it's already an embed URL, use it directly
		if (embedUrl.includes("/embed")) {
			// Already an embed URL, just ensure it has the right domain
			if (!embedUrl.startsWith("http")) {
				embedUrl = `https://${embedUrl}`
			}
		} else if (embedUrl.includes("sketchfab.com/")) {
			// Handle different Sketchfab URL formats
			let modelId: string | null = null

			// Try to extract model ID from /models/MODEL_ID format
			const modelsMatch = embedUrl.match(/\/models\/([a-zA-Z0-9]+)(?:\/|$|\?|#)/)
			if (modelsMatch && modelsMatch[1]) {
				modelId = modelsMatch[1]
			}
			// Try to extract model ID from /3d-models/...-MODEL_ID format
			// The model ID is typically a long alphanumeric string at the end
			else if (embedUrl.includes("/3d-models/")) {
				// Extract the last segment which should contain the model ID
				// Model IDs are typically 32+ character alphanumeric strings
				const segments = embedUrl.split("/")
				const lastSegment = segments[segments.length - 1]?.split("?")[0]?.split("#")[0]

				// The model ID is usually at the end after a hyphen, or the entire last segment if it's just the ID
				// Try to find a long alphanumeric string (32+ chars) which is typically the model ID
				const longIdMatch = lastSegment?.match(/([a-zA-Z0-9]{32,})/)
				if (longIdMatch && longIdMatch[1]) {
					modelId = longIdMatch[1]
				} else if (lastSegment && /^[a-zA-Z0-9]{20,}$/.test(lastSegment)) {
					// If the last segment is a long alphanumeric string, use it
					modelId = lastSegment
				} else if (lastSegment?.includes("-")) {
					// If it has hyphens, the model ID is usually the last part after the last hyphen
					const parts = lastSegment.split("-")
					const potentialId = parts[parts.length - 1]
					if (potentialId && /^[a-zA-Z0-9]{20,}$/.test(potentialId)) {
						modelId = potentialId
					}
				}
			}

			if (modelId) {
				embedUrl = `https://sketchfab.com/models/${modelId}/embed`
			} else {
				// If we can't parse it, return error
				return [
					"div",
					mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
						"data-type": "sketchfab",
					}),
					"Could not extract model ID from URL. Please use format: https://sketchfab.com/3d-models/... or https://sketchfab.com/models/MODEL_ID",
				]
			}
		} else {
			// Assume it's a model ID if it's just alphanumeric
			if (/^[a-zA-Z0-9]{20,}$/.test(embedUrl)) {
				embedUrl = `https://sketchfab.com/models/${embedUrl}/embed`
			} else {
				return [
					"div",
					mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
						"data-type": "sketchfab",
					}),
					"Invalid Sketchfab URL format. Please provide a full Sketchfab model URL or model ID",
				]
			}
		}

		// Validate the URL before creating URL object
		try {
			const urlObj = new URL(embedUrl)
			// Ensure it's a sketchfab.com domain
			if (!urlObj.hostname.includes("sketchfab.com")) {
				return [
					"div",
					mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
						"data-type": "sketchfab",
					}),
					"URL must be from sketchfab.com",
				]
			}

			// Add autostart and other parameters
			urlObj.searchParams.set("autostart", "0")
			urlObj.searchParams.set("ui_theme", "dark")
			embedUrl = urlObj.toString()
		} catch (e) {
			return [
				"div",
				mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "sketchfab" }),
				"Invalid URL format",
			]
		}

		return [
			"div",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-type": "sketchfab",
				class: "sketchfab-embed-wrapper",
			}),
			[
				"iframe",
				{
					title: title || "Sketchfab 3D model",
					src: embedUrl,
					width: width || "100%",
					height: height || "480",
					frameborder: "0",
					allowfullscreen: true,
					mozallowfullscreen: "true",
					webkitallowfullscreen: "true",
					allow: "autoplay; fullscreen; xr-spatial-tracking",
					"xr-spatial-tracking": "",
					"execution-while-out-of-viewport": "",
					"execution-while-not-rendered": "",
					"web-share": "",
					style: "width: 100%; height: 480px; border: none; border-radius: 8px;",
				},
			],
		]
	},

	addCommands() {
		return {
			setSketchfab:
				(options: { url: string; title?: string; width?: string; height?: string }) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: options,
					})
				},
		}
	},
})
