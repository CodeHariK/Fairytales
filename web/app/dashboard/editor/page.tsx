"use client"

import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/nav/site-header"
import { SidebarInset, SidebarProvider } from "@/components/modified/sidebar"
import { NotionEditor } from "@/components/editor/notion-editor"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/modified/card"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { toast } from "sonner"

function formatHTML(html: string): string {
	if (!html) return "No content yet..."

	// Remove existing whitespace between tags but preserve text content
	html = html.replace(/>\s+</g, "><").trim()

	let formatted = ""
	let indent = 0
	const indentSize = 2
	let i = 0

	while (i < html.length) {
		if (html[i] === "<") {
			// Handle tags
			const tagEnd = html.indexOf(">", i)
			if (tagEnd === -1) break

			const tag = html.substring(i, tagEnd + 1)
			const isClosingTag = tag.startsWith("</")
			const isSelfClosing = tag.endsWith("/>")
			const tagNameMatch = tag.match(/<\/?(\w+)/)
			const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : ""

			// Void elements that don't need closing tags
			const voidElements = [
				"area",
				"base",
				"br",
				"col",
				"embed",
				"hr",
				"img",
				"input",
				"link",
				"meta",
				"param",
				"source",
				"track",
				"wbr",
			]

			if (isClosingTag) {
				indent = Math.max(0, indent - 1)
				formatted += "\n" + " ".repeat(indent * indentSize) + tag
			} else {
				// Opening tag
				if (i > 0) {
					formatted += "\n" + " ".repeat(indent * indentSize)
				}
				formatted += tag

				// Increase indent if not void or self-closing
				if (!isSelfClosing && !voidElements.includes(tagName)) {
					indent++
				}
			}

			i = tagEnd + 1
		} else {
			// Handle text content
			const nextTag = html.indexOf("<", i)
			if (nextTag === -1) {
				// Last text node
				const text = html.substring(i).trim()
				if (text) {
					formatted += "\n" + " ".repeat(indent * indentSize) + text
				}
				break
			} else {
				const text = html.substring(i, nextTag).trim()
				if (text) {
					formatted += "\n" + " ".repeat(indent * indentSize) + text
				}
				i = nextTag
			}
		}
	}

	return formatted.trim()
}

export default function EditorPage() {
	const [content, setContent] = React.useState("")

	const handleSave = () => {
		// Here you would typically save the content to your backend
		console.log("Content to save:", content)
		toast.success("Content saved successfully!")
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Editor</h1>
							<p className="text-muted-foreground">
								Create and edit rich content with our powerful WYSIWYG editor
							</p>
						</div>
						<Button onClick={handleSave}>
							<Save className="mr-2 h-4 w-4" />
							Save
						</Button>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Rich Text Editor</CardTitle>
							<CardDescription>
								Use the toolbar above to format your text, add images, videos, and Sketchfab 3D
								models
							</CardDescription>
						</CardHeader>
						<CardContent>
							<NotionEditor
								content={content}
								onChange={setContent}
								placeholder="Start writing..."
							/>
						</CardContent>
					</Card>

					{/* Preview Section */}
					<Card>
						<CardHeader>
							<CardTitle>HTML Output</CardTitle>
							<CardDescription>Preview of the generated HTML</CardDescription>
						</CardHeader>
						<CardContent>
							<pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
								{formatHTML(content)}
							</pre>
						</CardContent>
					</Card>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
