import classNames from "classnames";
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
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { generateWeeks } from "@/data/reports.columns";
import { format, getWeekOfMonth } from "date-fns";
interface DataTable<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
export function ReportsTable<TData, TValue>({
  columns,
  data,
}: DataTable<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    generateWeeks().reduce((acc, week) => {
      const currentMonth = format(new Date(), "MMM");
      const monthWeek = week.split(" ")[0];
      const currentWeek = `${currentMonth} Wk${getWeekOfMonth(new Date())}`;
      acc[week] = currentWeek === week;
      return acc;
    }, {})
  );
  const [dropdownVisible, setDropdownVisibility] = useState(false);
  //   const finalData = useMemo(() => {
  //     const dataWithCurrentWeekActivity = data.filter((item) => {
  //       const isAllWeeksEmptyOrNull = Object.keys(item).every((key) => {
  //         // Skip non-week keys (assuming only the week keys have formats like "Jan Wk1")
  //         if (!/^[A-Za-z]{3} Wk\d$/.test(key)) return true;
  //         // Check if the value is either null or an empty string
  //         return item[key] === null || item[key] === "";
  //       });

  //       return !isAllWeeksEmptyOrNull;
  //     });

  //     return dataWithCurrentWeekActivity;
  //   }, [data]);

  //   console.log(finalData);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });
  return (
    <div>
      <div>
        <DropdownMenu
          open={dropdownVisible}
          onOpenChange={(open) => {
            if (open) {
              setDropdownVisibility(true);
            }
          }}
          defaultOpen
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Weeks
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onPointerDownOutside={() => {
              setDropdownVisibility(false);
            }}
            align="end"
            className="max-h-[500px] overflow-y-auto scrollbar-thin"
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  column.id !== "client" && (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
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
                          "bg-main-400 text-white shadow text-xs uppercase font-bold whitespace-nowrap min-w-[200px]",
                          index === headerGroup.headers.length - 1
                            ? "text-center"
                            : "",
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={classNames(
                          index === row.getVisibleCells().length - 1
                            ? "text-center"
                            : "",
                          index === 0
                            ? "sticky left-0 bg-slate-50 uppercase px-2 font-semibold"
                            : ""
                        )}
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
