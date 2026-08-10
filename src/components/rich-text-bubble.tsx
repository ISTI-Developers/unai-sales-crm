import { BubbleMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react";
import {
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Italic,
    List,
    ListOrdered,
    Type,
    Underline,
} from "lucide-react";
import { Button } from "./ui/button";
import { ReactNode } from "react";
import { ButtonGroup } from "./ui/button-group";
interface RichTextBubbleProps {
    editor: Editor
}
function RichTextBubble({ editor }: RichTextBubbleProps) {
    return (
        <BubbleMenu editor={editor} className="bg-white z-20">
            <div className="flex items-center gap-1 border bg-background p-2 shadow-md rounded-xl">
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
            </div>
        </BubbleMenu>
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
        <Button type="button" variant="ghost" data-active={isActive} size="icon" className="size-7 data-[active=true]:bg-gray-200" onClick={onClick} > {children} </Button>
    );
};
export default RichTextBubble