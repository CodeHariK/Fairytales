"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/modified/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon } from "lucide-react"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"

interface ImageEmbedProps {
	editor: Editor
}

export function ImageEmbed({ editor }: ImageEmbedProps) {
	const [open, setOpen] = React.useState(false)
	const [url, setUrl] = React.useState("")
	const [alt, setAlt] = React.useState("")
	const [title, setTitle] = React.useState("")

	const handleInsert = () => {
		if (!url.trim()) return

		editor
			.chain()
			.focus()
			.setImage({
				src: url.trim(),
				alt: alt.trim() || undefined,
				title: title.trim() || undefined,
			})
			.run()

		setOpen(false)
		setUrl("")
		setAlt("")
		setTitle("")
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
					<ImageIcon className="h-4 w-4 mr-2" />
					Image
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Insert Image</SheetTitle>
					<SheetDescription>
						Enter an image URL to embed the image in your content.
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="image-url">Image URL</Label>
						<Input
							id="image-url"
							placeholder="https://example.com/image.jpg"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
						/>
						<p className="text-sm text-muted-foreground">
							Enter a direct URL to an image file (jpg, png, gif, webp, etc.)
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="image-alt">Alt Text (optional)</Label>
						<Input
							id="image-alt"
							placeholder="Description of the image"
							value={alt}
							onChange={(e) => setAlt(e.target.value)}
						/>
						<p className="text-sm text-muted-foreground">
							Alternative text for accessibility and SEO
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="image-title">Title (optional)</Label>
						<Input
							id="image-title"
							placeholder="Image title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
						<p className="text-sm text-muted-foreground">Title attribute for the image</p>
					</div>
					<div className="flex gap-2 pt-4">
						<Button onClick={handleInsert} disabled={!url.trim()} className="flex-1">
							Insert Image
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setOpen(false)
								setUrl("")
								setAlt("")
								setTitle("")
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
