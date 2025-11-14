"use client"

import { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
	Heading1,
	Heading2,
	Heading3,
	AlignCenter,
	AlignLeft,
	AlignRight,
	AlignJustify,
	List,
	ListOrdered,
	Highlighter,
	Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SketchfabEmbed } from "@/components/editor/ui/sketchfab-embed"
import { YoutubeEmbed } from "@/components/editor/ui/youtube-embed"
import { ImageEmbed } from "@/components/editor/ui/image-embed"
import { LinkEmbed } from "@/components/editor/ui/link-embed"

interface EditorToolbarProps {
	editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
	if (!editor) {
		return null
	}

	return (
		<div className="border-b bg-muted/50 p-2 flex flex-wrap items-center gap-1">
			{/* Text Formatting */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-accent")}
			>
				<Bold className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-accent")}
			>
				<Italic className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				disabled={!editor.can().chain().focus().toggleUnderline().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("underline") && "bg-accent")}
			>
				<Underline className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("strike") && "bg-accent")}
			>
				<Strikethrough className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("codeBlock") && "bg-accent")}
			>
				<Code className="h-4 w-4" />
			</Button>

			{/* Background Color Dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						type="button"
						className={cn(
							"h-8 w-8 p-0",
							editor.getAttributes("textStyle").backgroundColor && "bg-accent"
						)}
					>
						<Highlighter className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-48">
					<DropdownMenuItem
						onClick={() => editor.chain().focus().unsetBackgroundColor().run()}
						className={!editor.getAttributes("textStyle").backgroundColor ? "bg-accent" : ""}
					>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded border border-border bg-transparent" />
							No Background
						</div>
					</DropdownMenuItem>
					{[
						"#8ce99a", // Green
						"#ffd43b", // Yellow
						"#ffa94d", // Orange
						"#ff8787", // Red
						"#da77f2", // Purple
						"#74c0fc", // Blue
						"#66d9ef", // Cyan
						"#a5d8ff", // Light Blue
						"#ffc9e4", // Pink
						"#b2f2bb", // Light Green
						"#ffec99", // Light Yellow
						"#d0bfff", // Lavender
					].map((color, index) => {
						const isActive = editor.isActive("textStyle", { backgroundColor: color })
						return (
							<DropdownMenuItem
								key={index}
								onClick={() => editor.chain().focus().setBackgroundColor(color).run()}
								className={isActive ? "bg-accent" : ""}
							>
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded border border-border"
										style={{ backgroundColor: color }}
									/>
									Color {index + 1}
								</div>
							</DropdownMenuItem>
						)
					})}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Text Color Dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						type="button"
						className={cn("h-8 w-8 p-0", editor.getAttributes("textStyle").color && "bg-accent")}
					>
						<Palette className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-48">
					<div className="p-2 border-b">
						<div className="flex items-center gap-2">
							<label htmlFor="text-color-picker" className="text-sm font-medium">
								Custom Color:
							</label>
							<input
								id="text-color-picker"
								type="color"
								onInput={(event) =>
									editor.chain().focus().setColor(event.currentTarget.value).run()
								}
								value={editor.getAttributes("textStyle").color || "#000000"}
								className="h-8 w-16 cursor-pointer rounded border border-border"
							/>
						</div>
					</div>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().unsetColor().run()}
						className={!editor.getAttributes("textStyle").color ? "bg-accent" : ""}
					>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded border border-border bg-transparent" />
							Default Color
						</div>
					</DropdownMenuItem>
					{[
						"#8ce99a", // Green
						"#ffd43b", // Yellow
						"#ffa94d", // Orange
						"#ff8787", // Red
						"#da77f2", // Purple
						"#74c0fc", // Blue
						"#66d9ef", // Cyan
						"#a5d8ff", // Light Blue
						"#ffc9e4", // Pink
						"#b2f2bb", // Light Green
						"#ffec99", // Light Yellow
						"#d0bfff", // Lavender
					].map((color, index) => {
						const isActive = editor.isActive("textStyle", { color: color })
						return (
							<DropdownMenuItem
								key={index}
								onClick={() => editor.chain().focus().setColor(color).run()}
								className={isActive ? "bg-accent" : ""}
							>
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded border border-border"
										style={{ backgroundColor: color }}
									/>
									Color {index + 1}
								</div>
							</DropdownMenuItem>
						)
					})}
				</DropdownMenuContent>
			</DropdownMenu>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Link */}
			<LinkEmbed editor={editor} />

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Headings */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" type="button" className="h-8">
						<Heading1 className="h-4 w-4 mr-2" />
						Heading
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().setParagraph().run()}
						className={editor.isActive("paragraph") ? "bg-accent" : ""}
					>
						Paragraph
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
					>
						<Heading1 className="mr-2 h-4 w-4" />
						Heading 1
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
					>
						<Heading2 className="mr-2 h-4 w-4" />
						Heading 2
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
					>
						<Heading3 className="mr-2 h-4 w-4" />
						Heading 3
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Alignment */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
				className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "left" }) && "bg-accent")}
			>
				<AlignLeft className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
				className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "center" }) && "bg-accent")}
			>
				<AlignCenter className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
				className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "right" }) && "bg-accent")}
			>
				<AlignRight className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().setTextAlign("justify").run()}
				className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "justify" }) && "bg-accent")}
			>
				<AlignJustify className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Lists */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-accent")}
			>
				<List className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-accent")}
			>
				<ListOrdered className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Media */}
			<ImageEmbed editor={editor} />
			<YoutubeEmbed editor={editor} />
			<SketchfabEmbed editor={editor} />
		</div>
	)
}
