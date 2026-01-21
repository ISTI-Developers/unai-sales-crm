import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
import { capitalize, cn } from "@/lib/utils";

interface List {
  id: string;
  value: string;
  label: string;
}

interface ComboboxProps {
  list: List[];
  title: string;
  value: List[];
  setValue: (id: string, action?: string) => void;
  disabled?: boolean | false;
}

export function MultiComboBox({
  list,
  title,
  value,
  setValue,
  disabled,
}: ComboboxProps) {
  const [open, onOpenChange] = useState(false);
  console.log(value);
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger disabled={disabled} asChild>
        <div
          className={cn(
            "whitespace-nowrap border shadow-sm rounded-md flex p-2 items-center justify-between bg-white w-full text-xs",
            disabled
              ? "opacity-70 pointer-events-none cursor-not-allowed"
              : "pointer-events-auto cursor-pointer"
          )}
        >
          <div className="inline-flex gap-1 flex-wrap flex-1">
            {value.length !== 0
              ? value.map((val) => {
                return (
                  <AnimatePresence>
                    <motion.p
                      id={val.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="px-2 rounded-md bg-green-300 flex items-center gap-1 capitalize"
                    >
                      {capitalize(val.label, "_")}
                      <button
                        title="x-button"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue(val.id, "remove");
                        }}
                      >
                        <X size={14} />
                      </button>
                    </motion.p>
                  </AnimatePresence>
                );
              })
              : `Select ${title.toLowerCase()}...`}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput className="text-xs" placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{title} not found</CommandEmpty>
            <CommandGroup>
              {list.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.value}
                  className="capitalize text-xs"
                  onSelect={() => {
                    setValue(item.id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.find((val) => val.id == item.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
