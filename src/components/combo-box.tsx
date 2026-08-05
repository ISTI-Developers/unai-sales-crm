import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { reportTags, ReportTags } from "@/interfaces/reports.interface"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"

interface ClientComboboxProps {
    value?: ReportTags[]
    onValueChange: (value: ReportTags[]) => void
}
function Combobox({ value, onValueChange }: ClientComboboxProps) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled>
                <div
                    role="button"
                    aria-expanded={open}

                    className="min-w-[150px] rounded-full h-7 justify-between text-xs px-2 pl-1 border flex items-center shadow-sm"
                >
                    {value && value.length ?
                        <div className="flex gap-0.5">
                            {value.slice(0, 3).map(item => {
                                return <Badge key={item} className='rounded-full bg-main-100/70 hover:bg-main-100/70 capitalize h-5 text-[0.6rem]'>{item.toLowerCase()}</Badge>
                            })}
                        </div>
                        :
                        <p className="pl-1">Select tags...</p>}
                    <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search tag..."
                        value={inputValue}
                        onValueChange={setInputValue}
                        className="h-8"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setInputValue(e.currentTarget.value)
                            }
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>Tag not found</CommandEmpty>
                        <CommandGroup>
                            {reportTags.map((tag) => (
                                <CommandItem
                                    key={tag}
                                    value={tag}
                                    className={cn("capitalize text-xs", value?.includes(tag) ? "bg-emerald-100" : "",
                                        // value && value.length >= 3 ? "pointer-events-none opacity-70" : ""
                                    )}
                                    onSelect={() => {
                                        const current = value ?? [];
                                        if (current.includes(tag)) {
                                            onValueChange(current.filter((t) => t !== tag));
                                        } else if (current.length < 3) {
                                            onValueChange([...current, tag]);
                                        }
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value?.includes(tag) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {tag.toLowerCase()}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover >
    )
}

export default Combobox