import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EditorContent, useEditor, } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Table, TableCell, TableRow, TableHeader } from "@tiptap/extension-table"
import { Heading } from "@tiptap/extension-heading"
import {
    File,
    XCircle,
    CopyIcon,
    Grid2X2XIcon,
    BetweenHorizonalStart,
    BetweenHorizonalEnd,
    BetweenVerticalEnd,
    BetweenVerticalStart,
    XIcon,
    PanelTop,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { safeParseTiptap } from "@/lib/format";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "./ui/context-menu";
import RichTextToolbar from "./rich-text-toolbar";
import RichTextBubble from "./rich-text-bubble";
import { cn } from "@/lib/utils";

export default function RichTextEditor({ value, onChange }: { value?: string; onChange: (content: string) => void }) {
    const [attachments, setAttachments] = useState<File[]>([]);
    // const attachmentInputRef = useRef<HTMLInputElement>(null);
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
            Placeholder.configure({
                placeholder: "Start writing..."
            })
        ],
        content: value ? safeParseTiptap(value) : "",
        onUpdate: ({ editor }) => {
            const data = JSON.stringify(editor.getJSON());
            onChange(data)
        }
    });
    useEffect(() => {
        if (!editor) return;

        const current = JSON.stringify(editor.getJSON());

        // Normalize empty values
        const nextContent = value?.trim() ? value : "";

        // Clear editor if external value is empty
        if (nextContent === "") {
            if (editor.isEmpty) return; // avoid unnecessary clear
            editor.commands.clearContent();
            return;
        }

        // Update editor only if content actually changed
        const parsed = safeParseTiptap(nextContent);
        const nextJson = JSON.stringify(parsed);

        if (current !== nextJson) {
            editor.commands.setContent(parsed); // false = don't emit another update
        }
    }, [editor, value]);

    return (
        <div className="relative w-full">
            <RichTextToolbar editor={editor} />
            <RichTextBubble editor={editor} />
            <div>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <EditorContent
                            spellCheck={false}
                            editor={editor}
                            className="min-h-25 max-h-75 overflow-y-auto rounded-md px-4 selection:bg-sky-100 selection:text-sky-600
                    [&_.ProseMirror]:outline-none

                    [&_.ProseMirror_h1]:text-4xl
                    [&_.ProseMirror_h1]:font-bold
                    [&_.ProseMirror_h1]:my-2

                    [&_.ProseMirror_h2]:text-3xl
                    [&_.ProseMirror_h2]:font-semibold
                    [&_.ProseMirror_h2]:my-2

                    [&_.ProseMirror_h3]:text-2xl
                    [&_.ProseMirror_h3]:font-medium
                    [&_.ProseMirror_h3]:my-1

                    [&_.ProseMirror_h4]:text-xl
                    [&_.ProseMirror_h4]:font-medium
                    [&_.ProseMirror_h4]:my-1
                    
                    [&_.ProseMirror_ul]:list-disc
                    [&_.ProseMirror_ul]:pl-4
                    [&_.ProseMirror_ol]:list-decimal
                    [&_.ProseMirror_ol]:pl-4"
                        />
                    </ContextMenuTrigger>
                    <ContextMenuContent className="bg-white">
                        <ContextMenuGroup>
                            <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onSelect={() => {
                                const { from, to } = editor.state.selection
                                const text = editor.state.doc.textBetween(from, to, " ")

                                navigator.clipboard.writeText(text)
                            }}>
                                <span className="text-xs">Copy</span>
                                <CopyIcon size={16} />
                            </ContextMenuItem>
                        </ContextMenuGroup>
                        {editor.isActive("table") &&
                            <ContextMenuGroup>
                                <ContextMenuItem className={cn("flex items-center justify-between gap-2 hover:bg-zinc-50", editor.isActive("tableHeader") ? "bg-zinc-100" : "")} onSelect={() => editor.chain().focus().toggleHeaderRow().run()}>
                                    <span className="text-xs">Toggle Header</span>
                                    <PanelTop size={16} />
                                </ContextMenuItem>
                                <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-xs">Rows</ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="bg-white">
                                        <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onClick={() => editor.chain().focus().addRowBefore().run()}>
                                            <span className="text-xs">Add Before</span>
                                            <BetweenHorizonalStart size={16} />
                                        </ContextMenuItem>
                                        <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onClick={() => editor.chain().focus().addRowAfter().run()}>
                                            <span className="text-xs">Add After</span>
                                            <BetweenHorizonalEnd size={16} />
                                        </ContextMenuItem>
                                        <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onClick={() => editor.chain().focus().deleteRow().run()}>
                                            <span className="text-xs">Remove Row</span>
                                            <XIcon size={16} />
                                        </ContextMenuItem>
                                    </ContextMenuSubContent>
                                </ContextMenuSub>
                                <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-xs"> Columns </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="bg-white">
                                        <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                                            <span className="text-xs">Add Before</span>
                                            <BetweenVerticalStart size={16} />
                                        </ContextMenuItem>
                                        <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                                            <span className="text-xs">Add After</span>
                                            <BetweenVerticalEnd size={16} />
                                        </ContextMenuItem>
                                        <ContextMenuItem className="flex items-center justify-between gap-2 hover:bg-zinc-50" onClick={() => editor.chain().focus().deleteColumn().run()}>
                                            <span className="text-xs">Remove Column</span>
                                            <XIcon size={16} />
                                        </ContextMenuItem>
                                    </ContextMenuSubContent>
                                </ContextMenuSub>
                                <ContextMenuItem className="flex items-center justify-between gap-2 text-red-300 hover:bg-zinc-50" onClick={() => editor.chain().focus().deleteTable().run()}>
                                    <span className="text-xs">Remove Table</span>
                                    <Grid2X2XIcon size={16} />
                                </ContextMenuItem>
                            </ContextMenuGroup>}

                    </ContextMenuContent>
                </ContextMenu>
                {
                    attachments.length > 0 &&
                    <ScrollArea orientation="horizontal" className="w-full max-w-6xl whitespace-nowrap rounded-lg">
                        <div className="flex w-max items-center gap-4 p-3 text-sm">
                            <AnimatePresence initial={false}>
                                {attachments.map((attachment, aIdx) => {
                                    return <motion.div
                                        key={`${attachment.name}-${aIdx}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 28
                                        }}
                                        className="group border px-2 w-fit min-w-[150px] rounded-lg flex items-center">
                                        <File className="shrink-0" size={30} strokeWidth={1} stroke="#a6a6a6" />
                                        <div className="w-full max-w-[125px] p-1 px-2 leading-tight">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="truncate font-medium text-xs">{attachment.name}</p>
                                                </TooltipTrigger>
                                                <TooltipContent>{attachment.name}</TooltipContent>
                                            </Tooltip>
                                            <p className="text-xs text-zinc-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button size="icon" onClick={() => setAttachments(prev => {
                                            const updatedFiles = prev.filter((_, index) => index !== aIdx);
                                            return updatedFiles;

                                        })} className="shrink-0 size-7 text-red-300 hover:bg-red-200 hover:text-red-500" variant="ghost">
                                            <XCircle />
                                        </Button>
                                    </motion.div>
                                })}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>

                }
            </div>
        </div >
    );
}