import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
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
} from "@tanstack/react-table";
import { useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "../ui/button";
import { generateWeeks } from "@/data/reports.columns";
import { getISOWeek } from "date-fns";
import { useReports } from "@/providers/reports.provider";
import { notFilter } from "@/misc/not.filter";
import TableConfigurations from "./config.report";
import SelectedFilters from "./filters.report";

interface DataTable<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ReportsTable<TData, TValue>({
  columns,
  data,
}: DataTable<TData, TValue>) {
  const weeks = generateWeeks();
  const { isPending, filters, visibleWeeks } = useReports();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      return visibleWeeks
        ? visibleWeeks
        : weeks.reduce<Record<string, boolean>>((acc, week, index) => {
            const weekIndex = getISOWeek(new Date()) - 1;
            acc[week] = weekIndex === index;
            return acc;
          }, {});
    }
  );

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
    estimateSize: () => 50, // adjust to your average row height
    overscan: 10,
  });

  return (
    <div className="flex flex-col gap-4">
      <TableConfigurations
        setValue={(value) => setGlobalFilter(value)}
        table={table}
        data={data}
        filters={columnFilters}
      />
      <SelectedFilters />

      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div
          className={cn(
            "overflow-auto",
            filters.length === 0
              ? "max-h-[calc(100vh-13.25rem)]"
              : "max-h-[calc(100vh-15.75rem)]"
          )}
          ref={parentRef}
        >
          <Table>
            <TableHeader className="sticky top-0 z-[3]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const columnID = header.column.id;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "bg-main-400 text-white shadow text-xs uppercase font-bold w-fit",
                          columnID !== "client" ? "text-center" : "",
                          index === 0 ? "sticky left-0" : ""
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
                  {/* Top padding */}
                  {rowVirtualizer.getVirtualItems()[0]?.start > 0 && (
                    <TableRow>
                      <TableCell
                        style={{
                          height: rowVirtualizer.getVirtualItems()[0].start,
                        }}
                        colSpan={columns.length}
                      />
                    </TableRow>
                  )}

                  {/* Render visible rows */}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const columnID = cell.column.id;
                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                columnID === "client"
                                  ? "sticky left-0 bg-slate-50 uppercase px-2 font-semibold w-[15vw] whitespace-break-spaces z-[2]"
                                  : [
                                      "sales_unit",
                                      "account_executive",
                                      "status",
                                    ].includes(columnID)
                                  ? "bg-slate-50 text-center max-w-[10vw] w-fit"
                                  : "text-left min-w-[400px] p-0"
                              )}
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

                  {/* Bottom padding */}
                  {(() => {
                    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
                    if (!lastItem) return null;

                    const bottomSpace =
                      rowVirtualizer.getTotalSize() - lastItem.end;

                    return (
                      bottomSpace > 0 && (
                        <TableRow>
                          <TableCell
                            style={{ height: bottomSpace }}
                            colSpan={columns.length}
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
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
