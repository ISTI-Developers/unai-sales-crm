import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { List } from "@/interfaces";

interface ComboboxProps {
  list: List[];
  title: string;
  value: string;
  setValue: (id: string, value: string) => void;
  disabled?: boolean;
}

export function ComboBox({
  list,
  title,
  value,
  setValue,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || false}
          className="w-full justify-between capitalize"
        >
          {value ? value : `Select ${title.toLowerCase()}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{title} not found</CommandEmpty>
            <CommandGroup>
              {list.map((item) => (
                <CommandItem
                  disabled={item.disabled ?? false}
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(
                      item.id,
                      currentValue === value ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <p className="capitalize">{item.label}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
