"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { useEffect } from "react";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, List, ListOrdered,
    Quote, Minus, Link as LinkIcon, Image as ImageIcon,
    Undo, Redo, AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
            }),
            Image,
            Placeholder.configure({ placeholder: placeholder || "Write something…" }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight,
            Typography,
        ],
        content,
        editorProps: {
            attributes: {
                class: "prose-editorial min-h-[400px] max-w-none focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div className="rounded-md border border-border bg-surface">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} className="px-6 py-4" />
        </div>
    );
}

function Toolbar({ editor }: { editor: Editor }) {
    const setLink = () => {
        const previous = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL", previous);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt("Image URL");
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold">
                <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic">
                <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline">
                <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough">
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="Heading 1">
                <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Heading 2">
                <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Heading 3">
                <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
                <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Blockquote">
                <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
                <Minus className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={setLink} active={editor.isActive("link")} label="Link">
                <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} label="Image">
                <ImageIcon className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} label="Align left">
                <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} label="Align center">
                <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} label="Align right">
                <AlignRight className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo">
                <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo">
                <Redo className="h-4 w-4" />
            </ToolbarButton>
        </div>
    );
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    label,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn(
                "rounded p-2 text-slate-600 transition-colors hover:bg-slate-100",
                active && "bg-slate-100 text-slate-900",
                disabled && "opacity-40"
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />;
}