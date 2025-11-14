"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/modified/input"
import { Label } from "@/components/ui/label"
import { Link as LinkIcon } from "lucide-react"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"

interface LinkEmbedProps {
	editor: Editor
}

export function LinkEmbed({ editor }: LinkEmbedProps) {
	const [open, setOpen] = React.useState(false)
	const [url, setUrl] = React.useState("")
	const [text, setText] = React.useState("")

	// Get current link attributes if link is active
	React.useEffect(() => {
		if (open) {
			if (editor.isActive("link")) {
				// Extend selection to include entire link for better UX
				editor.chain().focus().extendMarkRange("link").run()

				const attrs = editor.getAttributes("link")
				setUrl(attrs.href || "")

				// Get the link text
				const { from, to } = editor.state.selection
				if (from !== to) {
					setText(editor.state.doc.textBetween(from, to))
				} else {
					setText("")
				}
			} else {
				// Get selected text for new link
				const { from, to } = editor.state.selection
				if (from !== to) {
					setText(editor.state.doc.textBetween(from, to))
				} else {
					setText("")
				}
				setUrl("")
			}
		}
	}, [editor, open])

	const handleInsert = () => {
		if (!url.trim()) return

		const { from, to } = editor.state.selection
		const hasSelection = from !== to
		const linkActive = editor.isActive("link")

		if (linkActive) {
			// Update existing link - need to replace both URL and text
			// Determine what text to use
			const linkText = text.trim() || url.trim()

			// Extend mark range, delete selection, then insert new link
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.deleteSelection()
				.insertContent(`<a href="${url.trim()}">${linkText}</a>`)
				.run()
		} else if (text.trim() && !hasSelection) {
			// Insert new link with custom text (no selection)
			editor.chain().focus().insertContent(`<a href="${url.trim()}">${text.trim()}</a>`).run()
		} else if (hasSelection) {
			// Convert selected text to link
			editor.chain().focus().setLink({ href: url.trim() }).run()
		} else {
			// Insert link with URL as text (no selection, no custom text)
			editor.chain().focus().insertContent(`<a href="${url.trim()}">${url.trim()}</a>`).run()
		}

		setOpen(false)
		setUrl("")
		setText("")
	}

	const handleRemove = () => {
		editor.chain().focus().unsetLink().run()
		setOpen(false)
		setUrl("")
		setText("")
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			handleInsert()
		}
	}

	const isLinkActive = editor.isActive("link")

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="sm" type="button" className={isLinkActive ? "bg-accent" : ""}>
					<LinkIcon className="h-4 w-4 mr-2" />
					Link
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>{isLinkActive ? "Edit Link" : "Insert Link"}</SheetTitle>
					<SheetDescription>
						{isLinkActive
							? "Update the link URL or remove the link."
							: "Enter a URL to create a link. You can select text first to link it, or enter both URL and text."}
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="link-url">URL</Label>
						<Input
							id="link-url"
							placeholder="https://example.com"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
						/>
						<p className="text-sm text-muted-foreground">Enter the URL you want to link to</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="link-text">Link Text (optional)</Label>
						<Input
							id="link-text"
							placeholder="Link text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<p className="text-sm text-muted-foreground">
							Text to display for the link. If empty, selected text or URL will be used.
						</p>
					</div>
					<div className="flex gap-2 pt-4">
						<Button onClick={handleInsert} disabled={!url.trim()} className="flex-1">
							{isLinkActive ? "Update Link" : "Insert Link"}
						</Button>
						{isLinkActive && (
							<Button variant="destructive" onClick={handleRemove}>
								Remove
							</Button>
						)}
						<Button
							variant="outline"
							onClick={() => {
								setOpen(false)
								setUrl("")
								setText("")
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
