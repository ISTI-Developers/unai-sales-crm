import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Client = {
    id: string
    name: string
}

interface ClientComboboxProps {
    clients: Client[]
    value?: string
    onChange: (value: string) => void
}

export function ClientCombobox({ clients, value, onChange }: ClientComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const selectedClient = clients.find((c) => c.name === value)
    const selectedName = selectedClient?.name ?? value ?? ""

    const filteredClients = React.useMemo(() => {
        if (!inputValue) return clients.slice(0, 20);

        const lower = inputValue.toLowerCase();

        return clients
            .filter(c => c.name.toLowerCase().includes(lower))
            .slice(0, 20); // 🔥 hard cap
    }, [clients, inputValue]);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedName || "Select or enter client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search or type client..."
                        value={inputValue}
                        onValueChange={setInputValue}
                        onKeyDown={(e) => {
                            console.log(e.key)
                            if (e.key === "Enter") {
                                setInputValue(e.currentTarget.value)
                                onChange(e.currentTarget.value)
                                setOpen(false)
                            }
                        }}
                    />
                    <CommandList>
                        <CommandEmpty className="py-1">
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-light text-xs"
                                onClick={() => {
                                    onChange(inputValue)
                                    setOpen(false)
                                }}
                            >
                                Press <kbd className="border p-1 px-2 rounded-md text-xs">Enter</kbd> to use <span className="font-medium p-0">{inputValue}</span>
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredClients.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => {
                                        onChange(client.name)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === client.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {client.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
