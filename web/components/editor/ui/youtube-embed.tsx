"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/modified/input"
import { Label } from "@/components/ui/label"
import { Youtube } from "lucide-react"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"

interface YoutubeEmbedProps {
	editor: Editor
}

export function YoutubeEmbed({ editor }: YoutubeEmbedProps) {
	const [open, setOpen] = React.useState(false)
	const [url, setUrl] = React.useState("")
	const [width, setWidth] = React.useState("640")
	const [height, setHeight] = React.useState("360")

	const handleInsert = () => {
		if (!url.trim()) return

		editor
			.chain()
			.focus()
			.setYoutubeVideo({
				src: url.trim(),
				width: parseInt(width) || 640,
				height: parseInt(height) || 360,
			})
			.run()

		setOpen(false)
		setUrl("")
		setWidth("640")
		setHeight("360")
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			handleInsert()
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="sm" type="button">
					<Youtube className="h-4 w-4 mr-2" />
					YouTube
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Embed YouTube Video</SheetTitle>
					<SheetDescription>
						Enter a YouTube URL to embed the video in your content.
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="youtube-url">YouTube URL</Label>
						<Input
							id="youtube-url"
							placeholder="https://www.youtube.com/watch?v=..."
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
						/>
						<p className="text-sm text-muted-foreground">
							Supports standard YouTube URLs (youtube.com, youtu.be) or video IDs.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="youtube-width">Width</Label>
							<Input
								id="youtube-width"
								type="number"
								placeholder="640"
								value={width}
								onChange={(e) => setWidth(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="youtube-height">Height</Label>
							<Input
								id="youtube-height"
								type="number"
								placeholder="360"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex gap-2 pt-4">
						<Button onClick={handleInsert} disabled={!url.trim()} className="flex-1">
							Insert Video
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setOpen(false)
								setUrl("")
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
