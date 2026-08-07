
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { safeParseTiptap } from "@/lib/format";


function RichTextViewer({ content }: { content: string }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
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

    [&_.ProseMirror_h2]:text-2xl
    [&_.ProseMirror_h2]:font-semibold
    [&_.ProseMirror_h2]:my-3

    [&_.ProseMirror_p]:my-2
    
    [&_.ProseMirror_ul]:list-disc
    [&_.ProseMirror_ul]:pl-6
    [&_.ProseMirror_ol]:list-decimal
    [&_.ProseMirror_ol]:pl-6"
        />
    )
}

export default RichTextViewer