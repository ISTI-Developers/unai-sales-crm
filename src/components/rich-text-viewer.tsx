
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { safeParseTiptap } from "@/lib/format";
import Heading from "@tiptap/extension-heading";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import Link from "@tiptap/extension-link";


function RichTextViewer({ content }: { content: string }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableHeader,
            TableCell,
            Heading.configure({
                levels: [1, 2, 3, 4]
            }),
        ],
        editable: false,
        content: safeParseTiptap(content),
    });
    return (
        <EditorContent
            editor={editor}
            className="min-h-25 max-h-100 overflow-y-auto rounded-md border px-4 font-sans no-scrollbar
                [&_.ProseMirror]:outline-none

                [&_.ProseMirror_h1]:text-4xl
                [&_.ProseMirror_h1]:font-bold
                [&_.ProseMirror_h1]:my-4

                [&_.ProseMirror_h2]:text-3xl
                [&_.ProseMirror_h2]:font-semibold
                [&_.ProseMirror_h2]:my-3

                [&_.ProseMirror_h3]:text-2xl
                [&_.ProseMirror_h3]:font-semibold
                [&_.ProseMirror_h3]:my-2

                 [&_.ProseMirror_h4]:text-xl
                [&_.ProseMirror_h4]:font-medium
                [&_.ProseMirror_h4]:my-1
                
                [&_.ProseMirror_ul]:list-disc
                [&_.ProseMirror_ul]:pl-4
                [&_.ProseMirror_ol]:list-decimal
                [&_.ProseMirror_ol]:pl-4"
        />
    )
}

export default RichTextViewer