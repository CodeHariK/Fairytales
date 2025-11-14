"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle, Color, BackgroundColor } from "@tiptap/extension-text-style"
import Youtube from "@tiptap/extension-youtube"
import DragHandle from "@tiptap/extension-drag-handle-react"

// Custom extensions
import { CustomImage } from "@/components/editor/extension/image-extension"
import { Sketchfab } from "@/components/editor/extension/sketchfab-extension"

// UI components
import { EditorToolbar } from "./editor-toolbar"

import { cn } from "@/lib/utils"
import "./editor.css"

export interface NotionEditorProps {
	content?: string
	onChange?: (content: string) => void
	placeholder?: string
	className?: string
	editable?: boolean
}

export function NotionEditor({
	content = "",
	onChange,
	placeholder = "Start typing...",
	className,
	editable = true,
}: NotionEditorProps) {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			// Base extensions - exclude codeBlock and add custom one
			StarterKit.configure({
				link: {
					openOnClick: false,
					autolink: true,
					defaultProtocol: "https",
					protocols: ["http", "https"],
					isAllowedUri: (url, ctx) => {
						try {
							// construct URL
							const parsedUrl = url.includes(":")
								? new URL(url)
								: new URL(`${ctx.defaultProtocol}://${url}`)
							// use default validation
							if (!ctx.defaultValidate(parsedUrl.href)) {
								return false
							}
							// disallowed protocols
							const disallowedProtocols = ["ftp", "file", "mailto"]
							const protocol = parsedUrl.protocol.replace(":", "")
							if (disallowedProtocols.includes(protocol)) {
								return false
							}
							// only allow protocols specified in ctx.protocols
							const allowedProtocols = ctx.protocols.map((p) =>
								typeof p === "string" ? p : p.scheme
							)
							if (!allowedProtocols.includes(protocol)) {
								return false
							}
							// disallowed domains
							const disallowedDomains = ["example-phishing.com", "malicious-site.net"]
							const domain = parsedUrl.hostname
							if (disallowedDomains.includes(domain)) {
								return false
							}
							// all checks have passed
							return true
						} catch {
							return false
						}
					},
					shouldAutoLink: (url) => {
						try {
							// construct URL
							const parsedUrl = url.includes(":") ? new URL(url) : new URL(`https://${url}`)
							// only auto-link if the domain is not in the disallowed list
							const disallowedDomains = ["example-no-autolink.com", "another-no-autolink.com"]
							const domain = parsedUrl.hostname
							return !disallowedDomains.includes(domain)
						} catch {
							return false
						}
					},
				},
			}),

			// Text styling extensions
			TextStyle,
			Color,
			BackgroundColor,

			// Additional extensions
			TextAlign.configure({
				types: ["heading", "paragraph"],
				defaultAlignment: "left",
			}),

			// Media extensions
			CustomImage.configure({
				inline: false,
				allowBase64: true,
			}),
			Youtube.configure({
				controls: true,
				nocookie: false,
			}),
			Sketchfab,
		],
		content:
			content ||
			`
		<h1>Welcome to TipTap Editor</h1>
		<p>This is a powerful WYSIWYG editor with support for:</p>
		<ul>
			<li>Rich text formatting</li>
			<li>Images and videos</li>
			<li>Sketchfab 3D models</li>
			<li>And much more!</li>
		</ul>
		<p>Try hovering over blocks to see the drag handles.</p>
    `,
		editable,
		onUpdate: ({ editor }: { editor: any }) => {
			onChange?.(editor.getHTML())
		},
		editorProps: {
			attributes: {
				class: cn("notion-editor focus:outline-none min-h-[400px] p-4", className),
				"data-placeholder": placeholder,
			},
		},
	})

	React.useEffect(() => {
		if (editor && content && content !== editor.getHTML()) {
			editor.commands.setContent(content, { emitUpdate: false })
		}
	}, [content, editor])

	if (!editor) {
		return null
	}

	return (
		<EditorContext.Provider value={{ editor }}>
			<div className="border rounded-lg overflow-hidden bg-background">
				{editable && <EditorToolbar editor={editor} />}

				<div className="relative min-h-[400px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
					<EditorContent editor={editor} />
				</div>

				<DragHandle editor={editor}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
					</svg>
				</DragHandle>
			</div>
		</EditorContext.Provider>
	)
}
