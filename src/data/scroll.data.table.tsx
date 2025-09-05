import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ReactNode, useCallback, useRef } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children?: ReactNode;
  isFetching: boolean;
  onScrollBottom?: () => void; // called when user scrolls to bottom
}
export function InfiniteScrollDataTable<TData, TValue>({
  columns,
  data,
  children,
  onScrollBottom,
  isFetching,
}: DataTableProps<TData, TValue>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleScroll = useCallback(() => {
    const element = containerRef.current;

    if (!element || !onScrollBottom) return;

    const threshold = 100;
    const isNearBottom =
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - threshold;

    if (isNearBottom) {
      onScrollBottom();
    }
  }, [onScrollBottom]);

  return (
    <div className="flex flex-col gap-4 max-h-[calc(100vh-11.25rem)]">
      {children !== undefined && children}
      <div
        className="h-auto overflow-y-auto rounded-md border"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
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
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
            {isFetching && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-2"
                >
                  Loading more...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
