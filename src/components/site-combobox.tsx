import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { cn } from '@/lib/utils';
import { useSites } from '@/hooks/useSites';
import Fuse from 'fuse.js';

interface SiteComboboxProps {
    value: string,
    onValueSelect: (value: string) => void;
}
function SiteCombobox({ value, onValueSelect }: SiteComboboxProps) {
    const { data: sites = [] } = useSites();
    const [site, setSite] = useState<typeof sites[0] | undefined>(sites.find(item => item.site_code === value))
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("")

    const filteredSites = useMemo(() => {
        if (!inputValue) return sites.slice(0, 50);

        const lower = inputValue.toLowerCase();
        const fuse = new Fuse(sites, {
            includeMatches: true,
            threshold: 0.3,
            keys: ["site_code", "address", "area", "city"],
        });
        console.log(fuse.search(lower).map(res => res.item));
        return fuse.search(lower).map(res => res.item);
    }, [sites, inputValue]);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div role='button' className='border rounded-lg flex justify-between p-2 px-4 items-center'>
                    {site ?
                        <div className='flex flex-col leading-tight text-xs'>
                            <p className='font-semibold text-sm'>{site.site_code}</p>
                            <p>{site.address}</p>
                            <p className='font-light'>{site.board_facing}</p>
                        </div>
                        : <>Select site</>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search site..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>Record not found</CommandEmpty>
                        <CommandGroup>
                            {filteredSites.map((item) => (
                                <CommandItem
                                    disabled={value === item.site_code}
                                    key={item.site_code}
                                    value={item.site_code}
                                    onSelect={(currentValue) => {
                                        setSite(sites.find(s => s.site_code === currentValue))
                                        onValueSelect(currentValue)
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.site_code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className='flex flex-col leading-tight text-xs'>
                                        <p className='font-semibold text-sm'>{item.site_code}</p>
                                        <p>{item.address}</p>
                                        <p className='font-light'>{item.board_facing}</p>
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

export default SiteCombobox