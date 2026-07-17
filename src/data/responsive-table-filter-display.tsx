import { Filter } from '@/interfaces/tanstack-table';
import { formatAmount } from '@/lib/format';
import { PriceRange } from '@/misc/deckTemplate';
import { ColumnFiltersState, Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { EqualNot, XIcon } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react'
import { DateRange } from 'react-day-picker';

interface ResponsiveTableFilterDisplayProps<TData> {
    columnFilters: ColumnFiltersState;
    setEditingFilter: Dispatch<SetStateAction<Filter | undefined>>;
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
    table: Table<TData>
}

function ResponsiveTableFilterDisplay<TData>({ columnFilters, setColumnFilters, setEditingFilter, table }: ResponsiveTableFilterDisplayProps<TData>) {
    return (
        <>
            {columnFilters.map(columnFilter => {
                const column = table.getColumn(columnFilter.id)?.columnDef;
                const config = columnFilter.value as Filter;
                return <div role='button'
                    onClick={() => {
                        setEditingFilter({
                            ...config,
                            columnId: columnFilter.id
                        })
                        setColumnFilters(prev => {
                            return prev.filter(filter => filter.id !== columnFilter.id);
                        })
                    }} key={columnFilter.id} className='flex items-center gap-0.5 border text-xs leading-tight p-1 px-2 rounded-md bg-blue-50 border-blue-200 text-blue-600'>
                    <div className='flex gap-1 items-center'>
                        {column?.meta?.icon && <column.meta.icon size={12} />}
                        <p className='capitalize font-semibold leading-tight'>{columnFilter.id.replace("_", " ")}</p>
                    </div>
                    {config.condition === "is not" ? <EqualNot className='text-red-300' size={10} /> : ":"}
                    {['contains', 'between'].includes(config.condition) ?
                        column?.meta?.filterType === "date_range" ?
                            <div className='flex gap-1'>
                                <p>{format((config.value as DateRange).from!, "yyyy-MM-dd")}</p>
                                <span>-</span>
                                <p>{format((config.value as DateRange).to!, "yyyy-MM-dd")}</p>
                            </div>
                            : column?.meta?.filterType === "price_range" ?
                                <div className='flex gap-1'>
                                    <p>{formatAmount((config.value as PriceRange).from)}</p>
                                    <span>-</span>
                                    {(config.value as PriceRange).to === 0 ? <p>max</p> :
                                        <p>{formatAmount((config.value as PriceRange).to)}</p>
                                    }
                                </div> :
                                column?.meta?.filterType === "number_range" ?
                                    <div className='flex gap-1'>
                                        <p>{(config.value as PriceRange).from}</p>
                                        <span>-</span>
                                        {(config.value as PriceRange).to === 0 ? <p>max</p> :
                                            <p>{(config.value as PriceRange).to}</p>
                                        }
                                        {column.meta.filterLabel &&
                                            <p>{column.meta.filterLabel}</p>}
                                    </div>
                                    :
                                    <div className='capitalize'>
                                        {(config.value as string[]).join(", ")}
                                    </div>
                        : column?.meta?.filterType === "date_range" ?
                            <p>{format(config.value as Date, "yyyy-MM-dd")}</p>
                            :
                            column?.meta?.filterType === "price_range" ?
                                <p className='capitalize'>{formatAmount(config.value as string)}</p>
                                :
                                <p className='capitalize'>{config.value as string}</p>
                    }
                    <button type='button' onClick={(e) => {
                        e.stopPropagation();
                        setColumnFilters(prev => {
                            return prev.filter(filter => filter.id !== columnFilter.id);
                        })
                    }}>
                        <XIcon size={14} className='ml-1' />
                    </button>
                </div>
            })}
        </>
    )
}

export default ResponsiveTableFilterDisplay