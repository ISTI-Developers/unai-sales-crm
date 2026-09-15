import Search from '@/components/search';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, darkenColor } from '@/lib/utils';
import { ColumnDef, FilterFn, flexRender } from '@tanstack/react-table'
import { ReactNode } from 'react'
import ResponsiveTableFilters from './responsive-table-filters';
import ResponsiveTableFilterDisplay from './responsive-table-filter-display';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Columns3CogIcon } from 'lucide-react';
import { useResponsiveTable } from '@/hooks/use-responsive-table';

interface ResponsiveTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    children?: ReactNode,
    size?: number,
    getSubRows?: (row: TData) => TData[] | undefined;
    getRowClassName?: (row: TData) => string;
    globalFilterFn?: FilterFn<TData>;
    toolbarOrientation?: "vertical" | "horizontal"
}

function ResponsiveTable<TData, TValue>({ data, columns, children, size = 10, getSubRows, getRowClassName, globalFilterFn, toolbarOrientation = "vertical" }: ResponsiveTableProps<TData, TValue>) {
    const {
        table,
        columnFilters,
        isEditingFilter,
        setColumnFilters,
        setGlobalFilter,
        setEditingFilter,
    } = useResponsiveTable({
        data,
        columns,
        size,
        getSubRows,
        globalFilterFn,
    });
    return (
        <div className='flex flex-col gap-2 max-h-[calc(100vh-9rem)]'>
            <header className='flex items-start justify-between gap-2'>
                <div className={cn("flex gap-2", toolbarOrientation === "vertical" ? "flex-col" : "flex-row")}>
                    <div className='flex gap-2'>
                        <Search setValue={setGlobalFilter} className='max-w-[250px]' />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" className='size-7 px-1.5' variant="outline">
                                    <Columns3CogIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                {table.getAllColumns().filter((column) => {
                                    return column.getCanHide() && !column.columnDef.meta?.hidden
                                }).map(column => {
                                    return <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className='capitalize'
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value => column.toggleVisibility(!!value))}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {column.columnDef.meta?.label ?? column.id.replace(/_/g, " ")}
                                    </DropdownMenuCheckboxItem>
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className='flex gap-2 whitespace-nowrap items-center'>
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
                                    return <TableCell key={cell.id} valign="top" align={columnDef.meta?.isCentered ? "center" : undefined}>
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