import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Editor, } from "@tiptap/react";
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
    TextIcon,
    Heading3,
    Heading4,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

import { TablePicker } from "./table-picker";

interface RichTextToolbarProps {
    editor: Editor
}
function RichTextToolbar({ editor }: RichTextToolbarProps) {
    return (
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
                    isActive={editor.isActive("heading", { level: 3 })}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                    }
                >
                    <Heading3 className="!size-3.5" />
                </ToggleButton>
                <ToggleButton
                    isActive={editor.isActive("heading", { level: 4 })}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 4 })
                            .run()
                    }
                >
                    <Heading4 className="!size-3.5" />
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
                <TablePicker onSelect={(rows, columns) => {
                    editor.chain()
                        .focus()
                        .insertTable({
                            rows: rows,
                            cols: columns,
                            withHeaderRow: false,
                        })
                        .run()
                }} isActive={editor.isActive("table")} />
            </ButtonGroup>
            <ButtonGroup>
                <HyperlinkToggle editor={editor} />
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
            {/* <Input
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
            /> */}
        </div>
    )
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
}; const HyperlinkToggle = ({ editor }: { editor: Editor; }) => {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");

    const openLinkPopover = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        setLabel(selectedText); // empty if nothing selected 
        setUrl(editor.getAttributes("link").href ?? "");
        setOpen(true)
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
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
    )
}
export default RichTextToolbar