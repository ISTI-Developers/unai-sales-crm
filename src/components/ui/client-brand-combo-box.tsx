import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { useClients } from '@/hooks/useClients'
// import { useAuth } from '@/providers/auth.provider';
import { Button } from './button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Client } from '@/interfaces/client.interface';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';

interface ClientBrandComboboxProps {
    value?: Client;
    onValueChange: (value?: Client) => void;
    className?: string;
}
function ClientBrandCombobox({ value, onValueChange, className }: ClientBrandComboboxProps) {
    // const { user } = useAuth();
    const { data: clients, isLoading } = useClients();
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")

    const filteredClients = useMemo(() => {
        if (!clients || isLoading) return [];

        const seen = new Set<string>();

        const uniqueClients = clients
            .filter(client => {
                const key = `${client.name.trim().toLowerCase()}-${client.brand?.trim().toLowerCase()}`;

                if (seen.has(key)) return false;

                seen.add(key);
                return true;
            });

        if (!inputValue) return uniqueClients.slice(0, 20);

        const lower = inputValue.toLowerCase();
        const fuse = new Fuse(uniqueClients, {
            includeMatches: true,
            threshold: 0.4,
            keys: ["name", "brand"],
        });
        return fuse.search(lower).map(res => res.item)
            .slice(0, 20);
    }, [clients, inputValue, isLoading]);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-15", className)}
                >
                    <div className='flex flex-col items-start'>
                        {value ?
                            <>
                                <p className='font-semibold'>{value.name}</p>
                                {/* <p className='italic text-xs'>{value.brand}</p> */}
                            </>
                            : <>Select client...</>}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search or type client..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>Client not found.</CommandEmpty>
                        <CommandGroup>
                            {filteredClients.map((item) => (
                                <CommandItem
                                    key={item.client_id}
                                    value={item.name}
                                    onSelect={() => {
                                        onValueChange(item)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value?.name === item.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div>
                                        <p className='font-semibold'>{item.name}</p>
                                        <p className='italic text-xs'>{item.brand}</p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default ClientBrandCombobox