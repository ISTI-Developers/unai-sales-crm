import { useSites } from '@/hooks/useSites'
import { Site } from '@/interfaces/sites.interface';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
// import { useAuth } from '@/providers/auth.provider';
import { Button } from './button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { cn } from '@/lib/utils';

interface Props {
    value: Site;
    selectedSites: Site[];
    onValueChange: (site: Site) => void
    className?: string;
}

function SiteCombobox({ value, selectedSites, onValueChange, className }: Props) {
    const { data: sites, isLoading } = useSites();
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [site, setSite] = useState<Site>()

    const filteredSites = useMemo(() => {
        if (!sites || isLoading) return [];
        if (!inputValue) return sites.slice(0, 50);

        const lower = inputValue.toLowerCase();
        const fuse = new Fuse(sites, {
            includeMatches: true,
            threshold: 0.4,
            keys: ["site_code", "address"],
        });
        return fuse.search(lower).map(res => res.item);
    }, [sites, inputValue, isLoading]);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full max-w-sm justify-between h-15", className)}
                >
                    <div className='flex flex-col items-start whitespace-break-spaces'>
                        {value.ID ?
                            <>
                                <p className='text-xs font-bold'>{value.site_code}</p>
                                <p className='text-zinc-500 text-[0.65rem] text-start leading-tight'>{value.address}</p>
                                <p className='text-zinc-400 italic text-[0.6rem]'>{value.board_facing}</p>
                            </>
                            : <>Select site...</>}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search site..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>Site not found.</CommandEmpty>
                        <CommandGroup>
                            {filteredSites.map((item) => {
                                return <CommandItem
                                    key={item.ID}
                                    value={item.site_code}
                                    disabled={selectedSites.some(s => s.ID === item.ID)}
                                    onSelect={() => {
                                        setSite(item)
                                        onValueChange(item)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            site?.site_code === item.site_code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div>
                                        <p className='font-semibold'>{item.site_code}</p>
                                        <p className='text-xs'>{item.address}</p>
                                        <p className='italic text-[0.6rem]'>{item.board_facing}</p>
                                    </div>
                                </CommandItem>

                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default SiteCombobox