import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { capitalize, cn } from "@/lib/utils";

const MultiComboBoxWithAll = ({ title = "records", value, onValueChange, options, disabled, isSingle }:
    {
        title?: string;
        value: string[];
        onValueChange: (value: string[]) => void;
        options: string[],
        disabled?: boolean;
        isSingle?: boolean
    }) => {
    const [open, setOpen] = useState(false);

    const onValueSelect = (id: string) => {
        let selectedOptions = value.map(v => v);

        if (isSingle) {
            // single mode → just replace with the one id
            selectedOptions = [id];
        } else {
            // multi mode → toggle logic
            if (selectedOptions.includes(id)) {
                selectedOptions = selectedOptions.filter(optId => optId !== id);
            } else {
                selectedOptions = [...selectedOptions, id];
            }
        }

        const updatedValue = options.filter(opt => selectedOptions.includes(opt));

        onValueChange(updatedValue);
    };
    const onSelectAll = () => {
        onValueChange(options)
    }
    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger disabled={disabled} asChild>
                <Button variant="outline" className="w-full h-7 px-2 text-start justify-between max-w-full overflow-hidden">
                    {value.length > 0 ?
                        <div className="flex gap-1 text-[0.6rem]">
                            {value.length > 2 ? `Selected ${value.length} options` : value.join(", ").length > 16 ? `${value[0]}, +${value.length - 1} other` : value.join(", ")}
                        </div> :
                        <><span className="text-[0.65rem]">Select {capitalize(title, "_")}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandList>
                        <CommandEmpty>{title} not found</CommandEmpty>
                        <CommandGroup>
                            {options && <>
                                {!isSingle && <CommandItem value="all" onSelect={onSelectAll} className="text-[0.65rem]">
                                    <Check
                                        className={cn(
                                            "mr-2 h-2 w-2",
                                            value.find((val) => val === "all")
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    Check All
                                </CommandItem>}
                                {options.map(option => (
                                    <CommandItem key={option} value={option} onSelect={onValueSelect} className="text-[0.65rem]">
                                        <Check
                                            className={cn(
                                                "mr-2 h-2 w-2",
                                                value.find((val) => val == option)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {capitalize(option)}
                                    </CommandItem>
                                ))}
                            </>}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default MultiComboBoxWithAll