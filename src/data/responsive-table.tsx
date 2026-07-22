import Search from '@/components/search';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, darkenColor } from '@/lib/utils';
import { ColumnDef, ColumnFiltersState, FilterFn, flexRender, getCoreRowModel, getExpandedRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table'
import { ReactNode, useEffect, useState } from 'react'
import ResponsiveTableFilters from './responsive-table-filters';
import ResponsiveTableFilterDisplay from './responsive-table-filter-display';
import { Button } from '@/components/ui/button';
import { Filter } from '@/interfaces/tanstack-table';
import { useLocation } from 'react-router-dom';

interface ResponsiveTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    children?: ReactNode,
    size?: number,
    getSubRows?: (row: TData) => TData[] | undefined;
    getRowClassName?: (row: TData) => string;
    globalFilterFn?: FilterFn<TData>;
}

function ResponsiveTable<TData, TValue>({ data, columns, children, size = 10, getSubRows, getRowClassName, globalFilterFn }: ResponsiveTableProps<TData, TValue>) {
    const location = useLocation();
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
        getSubRows,
        globalFilterFn: globalFilterFn ?? "auto",
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination: paginationState,
        },
    });

    useEffect(() => {
        const storedFilters = sessionStorage.getItem(`filter${location.pathname}`)
        if (storedFilters) {
            try {
                setColumnFilters(JSON.parse(storedFilters));
            } catch {
                // Ignore parse errors
            }
        }
    }, [location])
    // Persist column filters to localStorage when they change
    useEffect(() => {
        if (columnFilters.length > 0) {
            sessionStorage.setItem(`filter${location.pathname}`, JSON.stringify(columnFilters));
        }
    }, [columnFilters, location]);
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
                            const bgColor = row.depth > 0 ? darkenColor("#FEFEFE", row.depth, 0.025) : "white"
                            return <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={cn(getRowClassName?.(row.original))} style={{
                                background: bgColor
                            }}>
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
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                {(() => {
                    const currentPage = table.getState().pagination.pageIndex;
                    const pageCount = table.getPageCount();

                    // Calculate the range of pages to show (at most 3 buttons)
                    const startPage = Math.max(0, currentPage - 1); // Show at least the previous page
                    const endPage = Math.min(pageCount - 1, startPage + 2); // Show at most 3 pages

                    const pagesToShow = [];
                    for (let i = startPage; i <= endPage; i++) {
                        pagesToShow.push(i);
                    }

                    return pagesToShow.map((index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(index)}
                            disabled={table.getState().pagination.pageIndex === index}
                        >
                            {index + 1}
                        </Button>
                    ));
                })()}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div >
    )
}

export default ResponsiveTable