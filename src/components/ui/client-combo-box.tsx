// components/ClientCombobox.tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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

    const selectedClient = clients.find((c) => c.id === value)
    const selectedName = selectedClient?.name ?? value ?? ""

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
                <Command shouldFilter={true}>
                    <CommandInput
                        placeholder="Search or type client..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                    onChange(inputValue)
                                    setOpen(false)
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Use “{inputValue}”
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {clients.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => {
                                        onChange(client.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === client.id ? "opacity-100" : "opacity-0"
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
