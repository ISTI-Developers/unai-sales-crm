import { useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Command, CommandEmpty, CommandInput, CommandItem } from './command'

function SelectSearch({ options, value = "", onSelect }: { options: string[]; value: string; onSelect: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const emptyRef = useRef<HTMLDivElement | null>(null);
    return (
        <Popover open={open} onOpenChange={(o) => {
            if (!o) {
                if (emptyRef.current && search.length > 0) {
                    onSelect(search)
                }
                setOpen(o)
            }
            setOpen(o)

        }}>
            <PopoverTrigger asChild>
                <Button className='bg-white justify-start' variant="outline">{value}</Button>
            </PopoverTrigger>
            <PopoverContent className='w-(--radix-popover-trigger-width)' asChild>
                <Command className='p-0'>
                    <CommandInput value={search} onValueChange={setSearch} />
                    <CommandEmpty ref={emptyRef} className='p-0 px-1 pb-2 text-xs'>Item not found. This will be added to the system.</CommandEmpty>
                    {options.map((option, index) =>
                        <CommandItem key={`${option}-${index}`} value={option} onSelect={onSelect}>{option}</CommandItem>
                    )}

                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default SelectSearch