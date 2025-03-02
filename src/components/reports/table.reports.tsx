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
  ColumnFiltersState,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { generateWeeks } from "@/data/reports.columns";
import { getISOWeek } from "date-fns";
import { Link } from "react-router-dom";
import { CirclePlus, X } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { Input } from "../ui/input";
import TableFilters from "@/misc/TableFilters";

interface DataTable<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
export function ReportsTable<TData, TValue>({
  columns,
  data,
}: DataTable<TData, TValue>) {
  const weeks = generateWeeks();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    weeks.reduce<Record<string, boolean>>((acc, week, index) => {
      const weekIndex = getISOWeek(new Date()) - 1;
      acc[week] = weekIndex === index; // Use `week` as the key
      return acc;
    }, {})
  );

  const [dropdownVisible, setDropdownVisibility] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
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
                        {capitalize(val)}
                        <X size={14} />
                      </Button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
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
            <Button variant="outline" className="mr-auto">
              Select Weeks
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
                  !["client", "account_executive", "sales_unit"].includes(
                    column.id
                  ) && (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {capitalize(column.id, "_")}
                    </DropdownMenuCheckboxItem>
                  )
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-1.5 pl-2"
        >
          <Link to="./add">
            <CirclePlus size={16} />
            Create Report
          </Link>
        </Button>
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="max-h-[calc(100vh-15rem)]">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const columnID = header.column.id;
                    return (
                      <TableHead
                        key={header.id}
                        className={classNames(
                          "bg-main-400 text-white shadow text-xs uppercase font-bold whitespace-nowrap min-w-[200px]",
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnID = cell.column.id;
                      return (
                        <TableCell
                          key={cell.id}
                          className={classNames(
                            columnID === "client"
                              ? "sticky left-0 bg-slate-50 uppercase px-2 font-semibold"
                              : ["sales_unit", "account_executive"].includes(
                                  columnID
                                )
                              ? "bg-slate-50"
                              : "text-center min-w-[200px]"
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
