import { MultiComboBox } from "@/components/multicombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableFilters from "@/misc/TableFilters";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table as T,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  size?: number;
}

interface Filters<TData> {
  table: T<TData>;
  data: TData[];
  filters: ColumnFiltersState;
}
interface List {
  id: string;
  value: string;
  label: string;
}

interface Conditions {
  id: string;
  column: string;
  condition: string;
  query: string | List[];
}
export function DataTable<TData, TValue>({
  columns,
  data,
  size = 10,
}: DataTableProps<TData, TValue>) {
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
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: paginationState,
    },
    onPaginationChange: setPaginationState,
  });

  console.log(columnFilters, globalFilter);
  return (
    <div>
      <div className="flex items-center pb-4 gap-4">
        <Input
          type="search"
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(event) => {
            setGlobalFilter(String(event.target.value));
          }}
          className="max-w-sm"
        />
        <TableFilters table={table} data={data} filters={columnFilters} />
        {columnFilters.length > 0 && (
          <div className="flex items-center bg-base p-1 px-2 rounded-md gap-2">
            {columnFilters.map((column, index) => {
              return (
                <div
                  key={column.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <p className="capitalize">{column.id.replace(/_/g, " ")}</p>
                  {column.value.map((val: string) => {
                    return (
                      <Button
                        size="xs"
                        variant="outline"
                        className="flex items-center gap-1.5 text-sm"
                        onClick={() => {
                          setColumnFilters((prev) => {
                            const updatedFilters = [...prev];

                            updatedFilters[index] = {
                              ...updatedFilters[index],
                              value: updatedFilters[index].value.filter(
                                (value) => value !== val
                              ),
                            };
                            let finalFilters = updatedFilters;
                            if (finalFilters[index].value.length === 0) {
                              finalFilters = finalFilters.filter(
                                (filter) => filter.id !== column.id
                              );
                            }

                            return finalFilters;
                          });
                        }}
                      >
                        {val}
                        <X size={14} />
                      </Button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ScrollArea className="rounded-md border">
        <div className="max-h-[calc(100vh-15rem)]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={classNames(
                          "sticky top-0 bg-main-400 text-white shadow text-xs uppercase font-bold",
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                ))
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
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft size={14} />
        </Button> */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {/* <ChevronLeft size={14} /> */}
          Previous
        </Button>
        {/* Page buttons (only showing 3 at a time) */}
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
          {/* <ChevronRight size={14} /> */}
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight size={14} />
        </Button> */}
      </div>
    </div>
  );
}
