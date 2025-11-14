"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/modified/input"
import { Label } from "@/components/ui/label"
import { Box } from "lucide-react"

interface SketchfabEmbedProps {
	editor: Editor
}

export function SketchfabEmbed({ editor }: SketchfabEmbedProps) {
	const [showForm, setShowForm] = React.useState(false)
	const [url, setUrl] = React.useState("")
	const [width, setWidth] = React.useState("100%")
	const [height, setHeight] = React.useState("480")

	const handleInsert = () => {
		if (!url.trim()) return

		editor.chain().focus().setSketchfab({ url, width, height }).run()
		setShowForm(false)
		setUrl("")
		setWidth("100%")
		setHeight("480")
	}

	if (showForm) {
		return (
			<div className="border rounded-lg p-4 space-y-4 bg-background">
				<div className="space-y-2">
					<Label htmlFor="sketchfab-url">Sketchfab Model URL or ID</Label>
					<Input
						id="sketchfab-url"
						placeholder="https://sketchfab.com/models/MODEL_ID or just MODEL_ID"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
					/>
					<p className="text-sm text-muted-foreground">
						Enter a Sketchfab model URL (e.g., https://sketchfab.com/models/abc123) or just the
						model ID. The embed URL will be generated automatically.
					</p>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="sketchfab-width">Width</Label>
						<Input
							id="sketchfab-width"
							placeholder="100%"
							value={width}
							onChange={(e) => setWidth(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="sketchfab-height">Height</Label>
						<Input
							id="sketchfab-height"
							placeholder="480"
							value={height}
							onChange={(e) => setHeight(e.target.value)}
						/>
					</div>
				</div>
				<div className="flex gap-2">
					<Button onClick={handleInsert} disabled={!url.trim()} size="sm">
						Insert
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							setShowForm(false)
							setUrl("")
						}}
						size="sm"
					>
						Cancel
					</Button>
				</div>
			</div>
		)
	}

	return (
		<Button variant="ghost" size="sm" type="button" onClick={() => setShowForm(true)}>
			<Box className="h-4 w-4 mr-2" />
			Sketchfab
		</Button>
	)
}
