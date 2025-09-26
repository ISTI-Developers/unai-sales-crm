import TableOptions from "@/components/tableOptions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  size?: number;
  children?: ReactNode;
  getSubRows?: (row: TData) => TData[] | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  size = 10,
  children,
  getSubRows,
}: DataTableProps<TData, TValue>) {
  const { pathname } = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
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
    getSubRows,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: paginationState,
    },
    onPaginationChange: setPaginationState,
  });

  // Load column filters from localStorage on mount
  useEffect(() => {
    const storedFilters = localStorage.getItem(`f${pathname}`);
    if (storedFilters) {
      try {
        setColumnFilters(JSON.parse(storedFilters));
      } catch {
        // Ignore parse errors
      }
    }
  }, [pathname]);

  // Persist column filters to localStorage when they change
  useEffect(() => {
    if (columnFilters.length > 0) {
      localStorage.setItem(`f${pathname}`, JSON.stringify(columnFilters));
    } else {
      //
    }
  }, [columnFilters, pathname]);
  return (
    <div className="flex flex-col gap-4 max-h-[calc(100vh-7.25rem)]">
      <div className="flex justify-between items-center">
        <TableOptions
          data={data}
          columnFilters={columnFilters}
          table={table}
          setColumnFilters={setColumnFilters}
          setGlobalFilter={setGlobalFilter}
        />
        {children !== undefined && children}
      </div>
      <div className="h-auto overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "sticky top-0 bg-main-400 text-white text-[0.65rem] whitespace-nowrap uppercase font-bold z-10",
                        index === headerGroup.headers.length - 1
                          ? "text-center"
                          : ""
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {

                const backgroundColor = row.depth > 0 ? `bg-zinc-${row.depth}00` : '';

                return <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(backgroundColor)}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={
                        index === row.getVisibleCells().length - 1
                          ? "text-center"
                          : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
    </div>
  );
}
