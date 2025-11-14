import Image from "@tiptap/extension-image"

export interface ImageOptions {
	inline: boolean
	allowBase64: boolean
	HTMLAttributes: Record<string, any>
}

/**
 * Custom Image extension with upload support
 */
export const CustomImage = Image.extend({
	name: "image",

	addOptions(this: { parent?: () => any }) {
		const parentOptions = this.parent?.() ?? {}
		return {
			...parentOptions,
			inline: false,
			allowBase64: true,
			HTMLAttributes: {},
		}
	},

	addAttributes(this: { parent?: () => any }) {
		const parentAttributes = this.parent?.() ?? {}
		return {
			...parentAttributes,
			src: {
				default: null,
			},
			alt: {
				default: null,
			},
			title: {
				default: null,
			},
			width: {
				default: null,
			},
			height: {
				default: null,
			},
		}
	},
})
