import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  getFilteredRowModel,
  PaginationState,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { useState, useRef, useMemo, ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "../ui/button";
import { useReports } from "@/providers/reports.provider";
import { notFilter } from "@/misc/not.filter";
import ResponsiveTableFilters from "@/data/responsive-table-filters";
import { Filter } from "@/interfaces/tanstack-table";
import ResponsiveTableFilterDisplay from "@/data/responsive-table-filter-display";
import TableConfigurations from "./config.report";

interface DataTable<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children?: ReactNode
}

export function ReportsTable<TData, TValue>({
  columns,
  data,
  children
}: DataTable<TData, TValue>) {
  const { isPending, filters, visibleWeeks } = useReports();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(visibleWeeks);
  const [isEditingFilter, setEditingFilter] = useState<Filter>()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination: paginationState,
    },
    filterFns: {
      not: notFilter,
    },
    onPaginationChange: setPaginationState,
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 15,
  });
  const stickyOffsets = useMemo(() => {
    let total = 0;

    return table.getVisibleLeafColumns().map((column) => {
      const offset = total;
      total += column.getSize();

      return offset;
    });
  }, [table]);
  return (
    <div className="flex flex-col gap-4">
      <header className='flex items-start justify-between gap-2'>
        <div className='space-y-2 w-full'>
          <div className="flex items-center justify-between">
            <TableConfigurations table={table} setValue={setGlobalFilter} />
            {children}
          </div>
          <div className='flex gap-1 flex-wrap items-center'>
            <ResponsiveTableFilterDisplay columnFilters={columnFilters} setEditingFilter={setEditingFilter} setColumnFilters={setColumnFilters} table={table} />
            <ResponsiveTableFilters table={table} editingFilter={isEditingFilter} setEditingFilter={setEditingFilter} />
          </div>
        </div>
      </header>
      <div className="w-full whitespace-nowrap rounded-md border overflow-hidden">
        <div
          className={cn(
            "overflow-y-auto max-w-full relative",
            filters.length === 0
              ? "max-h-[calc(100vh-13.25rem)]"
              : "max-h-[calc(100vh-15.75rem)]"
          )}
          ref={parentRef}
        >
          <Table className="border-collapse t">
            <TableHeader className="sticky top-0 z-[3]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const columnID = header.column.id;
                    const isSticky = header.column.columnDef.meta?.isSticky;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "bg-white text-main-400 shadow text-[0.65rem] uppercase font-bold w-full",
                          columnID !== "client" ? "text-center" : "",
                          isSticky ? "sticky z-[10] bg-white" : ""
                        )}
                        style={{ left: stickyOffsets[index], width: header.column.getSize(), maxWidth: header.column.getSize() }}
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
              {isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-[calc(10em)] bg-slate-100 animate-pulse"
                  >
                    Loading
                  </TableCell>
                </TableRow>
              ) : rowVirtualizer.getVirtualItems().length > 0 ? (
                <>
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{
                        height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0
                      }}
                    />
                  </tr>

                  {/* Render visible rows */}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        ref={rowVirtualizer.measureElement}
                        data-index={virtualRow.index}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-white relative"
                      >
                        {row.getVisibleCells().map((cell, index) => {
                          const columnID = cell.column.id;
                          const isSticky = cell.column.columnDef.meta?.isSticky;
                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                columnID === "client"
                                  ? "uppercase px-2 font-semibold truncate"
                                  : [
                                    "sales_unit",
                                    "account_executives",
                                    "status",
                                  ].includes(columnID)
                                    ? "text-center"
                                    : "text-left p-0",
                                isSticky ? "sticky z-[2] bg-white" : "",
                              )}
                              style={{ left: stickyOffsets[index], width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {(() => {
                    const lastItem = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1];

                    if (!lastItem) return null;

                    const bottomSpace =
                      rowVirtualizer.getTotalSize() - lastItem.end;

                    return (
                      bottomSpace > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            style={{
                              height: bottomSpace,
                            }}
                          />
                        </TableRow>
                      )
                    );
                  })()}
                </>
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
          const startPage = Math.max(0, currentPage - 1);
          const endPage = Math.min(pageCount - 1, startPage + 2);
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
