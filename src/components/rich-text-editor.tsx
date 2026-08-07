import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
    Bold,
    Italic,
    Underline,
    Heading1,
    Heading2,
    Type,
    List,
    ListOrdered,
    LinkIcon,
    Unlink,
    File,
    XCircle,
    TextIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { safeParseTiptap } from "@/lib/format";

export default function RichTextEditor({ value, onChange }: { value?: string; onChange: (content: string) => void }) {
    const [attachments, setAttachments] = useState<File[]>([]);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [openPopover, setOpenPopover] = useState(false)
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            Link.configure({
                openOnClick: false,
                autolink: true,
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

    const openLinkPopover = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        setLabel(selectedText); // empty if nothing selected 
        setUrl(editor.getAttributes("link").href ?? "");
        setOpenPopover(true)
    };


    return (
        <div className="relative w-full">
            <div className="sticky top-0 z-10 flex gap-4 bg-zinc-50 p-2">
                <ButtonGroup>
                    <ToggleButton
                        isActive={editor.isActive("bold")}
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                    >
                        <Bold strokeWidth={3} className="!size-3.5" />
                    </ToggleButton>

                    <ToggleButton
                        isActive={editor.isActive("italic")}
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                    >
                        <Italic className="!size-3.5" />
                    </ToggleButton>

                    <ToggleButton
                        isActive={editor.isActive("underline")}
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                    >
                        <Underline className="!size-3.5" />
                    </ToggleButton>
                </ButtonGroup>
                <ButtonGroup>
                    <ToggleButton
                        isActive={editor.isActive("bulletList")}
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                    >
                        <List className="!size-3.5" />
                    </ToggleButton>

                    <ToggleButton
                        isActive={editor.isActive("orderedList")}
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                    >
                        <ListOrdered className="!size-3.5" />
                    </ToggleButton>
                </ButtonGroup>
                <ButtonGroup>
                    <ToggleButton
                        isActive={editor.isActive("heading", { level: 1 })}
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                    >
                        <Heading1 className="!size-3.5" />
                    </ToggleButton>

                    <ToggleButton
                        isActive={editor.isActive("heading", { level: 2 })}
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                    >
                        <Heading2 className="!size-3.5" />
                    </ToggleButton>

                    <ToggleButton
                        isActive={editor.isActive("paragraph")}
                        onClick={() =>
                            editor.chain().focus().setParagraph().run()
                        }
                    >
                        <Type className="!size-3.5" />
                    </ToggleButton>
                </ButtonGroup>

                <ButtonGroup>
                    <Popover open={openPopover} onOpenChange={setOpenPopover}>
                        <PopoverTrigger>
                            <ToggleButton
                                onClick={openLinkPopover}
                                isActive={editor.isActive("link")}
                            >
                                <LinkIcon className="!size-3.5" />
                            </ToggleButton>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 flex flex-col gap-2">
                            <InputGroup className="h-7">
                                <InputGroupAddon className="pl-2">
                                    <TextIcon />
                                </InputGroupAddon>
                                <InputGroupInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Enter label here" className="text-xs" />
                            </InputGroup>
                            <InputGroup className="h-7">
                                <InputGroupAddon className="pl-2">
                                    <LinkIcon />
                                </InputGroupAddon>
                                <InputGroupInput value={url} type="url" onChange={(e) => setUrl(e.target.value)} placeholder="Enter link here" className="text-xs" />
                            </InputGroup>
                            <Button className="text-xs h-7 w-fit ml-auto shadow-none bg-gray-100" variant="outline" onClick={() => {
                                if (url === "") {
                                    editor.chain().focus().unsetLink().run();
                                    return;
                                }
                                const { from, to } = editor.state.selection;
                                const hasSelection = from !== to;

                                if (hasSelection) {
                                    editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange("link")
                                        .setLink({ href: url })
                                        .run();
                                } else {
                                    if (label.trim() === "") return;

                                    editor
                                        .chain()
                                        .focus()
                                        .insertContent({
                                            type: "text",
                                            text: label,
                                            marks: [
                                                {
                                                    type: "link",
                                                    attrs: {
                                                        href: url
                                                    }
                                                }
                                            ]
                                        })
                                        .run();
                                }

                            }}>Save</Button>
                        </PopoverContent>
                    </Popover>
                    {editor.isActive("link") &&
                        <ToggleButton
                            onClick={() => {
                                editor.chain().focus().unsetLink().run();
                            }}
                        >
                            <Unlink className="!size-3.5" />
                        </ToggleButton>
                    }
                </ButtonGroup>
                {/* <ButtonGroup>
                    <ToggleButton
                        onClick={() => attachmentInputRef.current?.click()}
                    >
                        <Paperclip className="!size-3.5" />
                    </ToggleButton>
                </ButtonGroup> */}
            </div>
            <div>
                <Input
                    ref={attachmentInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                        if (e.target.files) {
                            const files = Object.values(e.target.files).map(file => file);
                            setAttachments(prev => {
                                if (!prev) return prev;

                                return [...prev, ...files]
                            })
                        }
                    }}
                />

                <EditorContent
                    editor={editor}
                    className="min-h-25 max-h-75 overflow-y-auto rounded-md px-4
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

const ToggleButton = ({
    onClick,
    children,
    isActive = false,
}: {
    isActive?: boolean;
    onClick: () => void;
    children: ReactNode;
}) => {
    return (
        <Button type="button" variant="outline" data-active={isActive} size="icon" className="size-7 data-[active=true]:bg-gray-200" onClick={onClick} > {children} </Button>
    );
};