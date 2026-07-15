/* eslint-disable @typescript-eslint/no-unused-vars */
import Search from '@/components/search';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getExpandedRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table'
import { ReactNode, useState } from 'react'
import ResponsiveTableFilters from './responsive-table-filters';
import ResponsiveTableFilterDisplay from './responsive-table-filter-display';

interface ResponsiveTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    children?: ReactNode,
    size?: number
}

export type FilterOption = "is" | "is not" | "contains" | "between";
export type Filter = {
    columnId: string;
    condition: FilterOption;
    value: unknown;

}

function ResponsiveTable<TData, TValue>({ data, columns, children, size = 10 }: ResponsiveTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isEditingFilter, setEditingFilter] = useState<Filter>()
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: size,
    });
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onPaginationChange: setPaginationState,
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination: paginationState,
        },
    });

    return (
        <div className='flex flex-col gap-2 max-h-[calc(100vh-9rem)]'>
            <header className='flex items-start justify-between gap-2'>
                <div className='space-y-2'>
                    <Search setValue={setGlobalFilter} className='max-w-[250px]' />
                    <div className='flex gap-1 flex-wrap items-center'>
                        <ResponsiveTableFilterDisplay columnFilters={columnFilters} setEditingFilter={setEditingFilter} setColumnFilters={setColumnFilters} table={table} />
                        <ResponsiveTableFilters table={table} editingFilter={isEditingFilter} setEditingFilter={setEditingFilter} />
                    </div>
                </div>
                {children}
            </header>
            <main className='h-auto overflow-auto rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.filter(header => !header.column.columnDef.meta?.hidden).map((header) => {
                                    const columnDef = header.column.columnDef;
                                    const meta = columnDef.meta;
                                    const Icon = meta?.icon;
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "sticky top-0 bg-white text-main-400 text-[0.6rem] h-7 whitespace-nowrap uppercase font-bold z-[9]",
                                            )}
                                        >
                                            <div className='flex items-center gap-1'>
                                                {columnDef.header &&
                                                    <>
                                                        {Icon && <Icon size={14} />}
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </>
                                                }

                                            </div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => {
                            return <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().filter(cell => !cell.column.columnDef.meta?.hidden).map((cell) => {
                                    const columnDef = cell.column.columnDef;
                                    return <TableCell
                                        key={cell.id}
                                        className={cn(columnDef.meta?.isCentered ? "flex items-center justify-center" : "")}>
                                        {columnDef.cell && flexRender(
                                            columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                })}
                            </TableRow>
                        })) : (<TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results found.
                            </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </main>
        </div >
    )
}

export default ResponsiveTable