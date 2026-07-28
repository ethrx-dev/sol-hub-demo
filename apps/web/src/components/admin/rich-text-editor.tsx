"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 200 }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || "Start writing..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== "<p></p>") {
        onChange(html);
      } else {
        onChange("");
      }
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:", linkUrl || "https://");
    if (url) {
      setLinkUrl(url);
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("bold") ? "bg-muted" : ""}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("italic") ? "bg-muted" : ""}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("underline") ? "bg-muted" : ""}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("bulletList") ? "bg-muted" : ""}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("orderedList") ? "bg-muted" : ""}`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={addLink}
          className={`rounded p-1.5 transition-colors hover:bg-muted ${editor.isActive("link") ? "bg-muted" : ""}`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="rounded p-1.5 transition-colors hover:bg-muted"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="rounded p-1.5 transition-colors hover:bg-muted"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
      <div className="px-3 py-2" style={{ minHeight: `${minHeight}px` }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
