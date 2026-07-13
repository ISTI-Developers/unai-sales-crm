import { MultiComboBox } from '@/components/multicombobox';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/datepicker';
import { DateRangePicker } from '@/components/ui/daterangepicker';
import { Label } from '@/components/ui/label';
import InputNumber from '@/components/ui/number-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriceRange } from '@/misc/deckTemplate';
import { Column, Table } from '@tanstack/react-table';
import { ChevronLeft, FilterIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Filter } from './responsive-table';

interface ResponsiveTableFiltersProps<TData> {
    table: Table<TData>;
    editingFilter?: Filter;
    setEditingFilter: Dispatch<SetStateAction<Filter | undefined>>;
}
function ResponsiveTableFilters<TData>({ table, editingFilter, setEditingFilter }: ResponsiveTableFiltersProps<TData>) {
    const [open, setOpen] = useState(false);
    const [option, setOption] = useState("")

    const column = useMemo(() => {
        if (option === "") return null;

        return table.getColumn(option);
    }, [option, table])

    useEffect(() => {
        if (!editingFilter) return;
        setOption(editingFilter.columnId);
        setOpen(true)
    }, [editingFilter]);
    return (
        <Popover open={open} onOpenChange={(open) => {
            setOption("")
            setEditingFilter(undefined)
            setOpen(open);
        }}>
            <PopoverTrigger className='text-xs flex items-center gap-1 border p-1 px-2 rounded-md h-7'>
                <FilterIcon size={12} />
                <p>Filter</p>
            </PopoverTrigger>
            <PopoverContent align='start' className='p-1'>
                <div>
                    {column ?
                        <FilterItem column={column} setOption={setOption} onOpenChange={setOpen} editingFilter={editingFilter} />
                        :
                        <Command>
                            <CommandInput className='h-7' />
                            <CommandList>
                                <CommandEmpty>Filter not found.</CommandEmpty>
                                {table.getAllColumns().filter(col => col.getCanFilter()).map(column => {
                                    const label = column.id.replace("_", " ");
                                    const Icon = column.columnDef.meta?.icon;
                                    const isDisabled = table.getState().columnFilters.some(filter => filter.id === column.id);
                                    return <CommandItem className='capitalize flex gap-2' disabled={isDisabled} onSelect={() => setOption(column.id)}>
                                        {Icon && <Icon size={14} />}
                                        {label}
                                    </CommandItem>
                                })}
                            </CommandList>
                        </Command>
                    }
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface FilterItemProps<TData> {
    column: Column<TData, unknown>;
    editingFilter?: Filter;
    setOption: Dispatch<SetStateAction<string>>;
    onOpenChange: (open: boolean) => void;
}
function FilterItem<TData>({ column, editingFilter, setOption, onOpenChange }: FilterItemProps<TData>) {
    const meta = column.columnDef.meta;
    const label = column.id.replace("_", " ");
    const [condition, setCondition] = useState("")
    const [value, setValue] = useState<unknown>("")

    const choices = useMemo(() => {
        if (meta?.isArray) {
            const values = new Set<string>();

            column.getFacetedRowModel().rows.forEach(row => {
                const items = row.getValue<string[]>(column.id);

                items.forEach(item => values.add(item));
            });

            return [...values].sort();
        }

        return Array.from(column.getFacetedUniqueValues().keys());
    }, [column, meta?.isArray]);

    const onSaveFilter = () => {
        column.setFilterValue({
            condition,
            value
        })
        onOpenChange(false);
        setOption("")
        setCondition("")
    }

    useEffect(() => {
        if (!meta?.allowedOptions) return;

        setCondition(
            editingFilter?.condition ?? meta.allowedOptions[0]
        );
        setValue(editingFilter?.value ?? "");
    }, [editingFilter, meta?.allowedOptions, column]);

    useEffect(() => {
        if (editingFilter) {
            setValue(editingFilter.value);
            return;
        }
        if (!meta?.filterType || !condition) return;

        if (["is", "is not"].includes(condition)) {
            if (meta.filterType === "date_range") {
                setValue(new Date())
            } else {
                setValue("")
            }
        } else if (condition === "contains") {
            if (meta.filterType === "date_range") {
                setCondition("is")
                setValue(new Date())
            } else {
                setValue([] as string[])
            }

        } else {
            if (meta.filterType === "date_range") {
                setValue(undefined as DateRange | undefined)
            } else {
                setValue({
                    from: 0,
                    to: 0
                })
            }
        }
    }, [meta, condition, editingFilter])

    return <div>
        <header className='flex items-center gap-2 p-2'>
            <Button variant="ghost" size="icon" className='size-6' onClick={() => setOption("")}>
                <ChevronLeft />
            </Button>
            <div className='flex items-center gap-1'>
                {meta?.icon && <meta.icon size={14} />}
                <p className='capitalize text-sm font-semibold'>{label}</p>
            </div>
            <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className='w-fit text-xs p-2 h-7 shadow-none'>
                    <SelectValue placeholder="condition" />
                </SelectTrigger>
                <SelectContent>
                    {meta?.allowedOptions && meta.allowedOptions.map(option => {
                        return <SelectItem key={option} value={option}>{option}</SelectItem>
                    })}
                </SelectContent>
            </Select>
        </header>
        <main className='p-2 pt-0'>
            {["is", "is not"].includes(condition) &&
                <>
                    {meta?.filterType === "date_range" ?
                        <DatePicker date={value as Date} onDateChange={(date) => setValue(date)} className='h-8' />
                        : meta?.filterType === "price_range" ?
                            <InputNumber value={value as string | number | readonly string[] | undefined} onChange={(e) => setValue(e.target.value)} />
                            :
                            <Select value={value as string} onValueChange={(val) => {
                                setValue(val)
                            }}>
                                <SelectTrigger className='text-xs px-2 h-[33.75px] capitalize'>
                                    <SelectValue placeholder={`Select ${label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {choices.map(choice => {
                                        return <SelectItem value={choice} className='capitalize'>{choice}</SelectItem>
                                    })}
                                </SelectContent>
                            </Select>}
                </>
            }
            {condition === "contains" &&
                <MultiComboBox list={choices.map(ch => {
                    return {
                        id: ch,
                        value: ch,
                        label: ch
                    }
                })} value={(Array.isArray(value) ? value : []).map(ch => {
                    return {
                        id: ch,
                        value: ch,
                        label: ch
                    }
                })} setValue={(id) => {
                    setValue((prev: string[]) => {
                        if (!prev) return prev;
                        console.log(prev);
                        return prev.includes(id) ? prev.filter(val => val !== id) : [...prev, id]
                    })
                }} title={label} />
            }
            {condition === "between" &&
                <>
                    {meta?.filterType === "date_range" ?
                        <DateRangePicker date={value as DateRange | undefined} onDateChange={(value) => setValue(value)} className='w-full h-8' />
                        :
                        <div className='space-y-1'>
                            <div>
                                <Label>Min</Label>
                                <InputNumber value={(value as PriceRange).from} onChange={(e) => setValue((prev: PriceRange) => {
                                    const value = Number(e.target.value);
                                    return {
                                        ...prev,
                                        from: isNaN(value) ? 0 : value
                                    }
                                })} />
                            </div>
                            <div>
                                <Label>Max</Label>
                                <InputNumber value={(value as PriceRange).to} onChange={(e) => setValue((prev: PriceRange) => {
                                    const value = Number(e.target.value);
                                    return {
                                        ...prev,
                                        to: isNaN(value) ? 0 : value,
                                    }
                                })} />
                            </div>
                        </div>}
                </>
            }
        </main>
        <footer className='p-2 pt-0 flex justify-end'>
            <Button type='button' onClick={onSaveFilter} size="sm" className='bg-main-100'>Show results</Button>
        </footer>
    </div>
}

export default ResponsiveTableFilters