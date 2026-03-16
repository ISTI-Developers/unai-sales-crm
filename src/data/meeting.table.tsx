import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, ReactNode, useMemo, Dispatch, SetStateAction, useEffect } from "react";
import { generateWeeks } from "@/data/reports.columns";
import { getISOWeek } from "date-fns";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { capitalize } from "@/lib/utils";

interface DataTable<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children: ReactNode;
  selectedWeeks: (`${string} Wk${number}`)[];
  setWeeks: Dispatch<SetStateAction<(`${string} Wk${number}`)[]>>;
  year: number;
}

export function MeetingTable<TData, TValue>({
  columns,
  data,
  children,
  selectedWeeks,
  setWeeks,
  year
}: DataTable<TData, TValue>) {
  const weeks = useMemo(() => generateWeeks(year), [year])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openWeeks, setOpenWeeks] = useState(false);


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    const currentWeekIndex = getISOWeek(new Date()) - 1;

    const visibility = weeks.reduce<Record<string, boolean>>((acc, week, index) => {
      if (selectedWeeks.length > 0) {
        acc[week] = selectedWeeks.includes(week as `${string} Wk${number}`);
      } else {
        acc[week] = index === currentWeekIndex;
      }

      return acc;
    }, {});

    setColumnVisibility(visibility);
  }, [weeks, selectedWeeks]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {children}
        <DropdownMenu
          open={openWeeks}
          onOpenChange={(open) => {
            if (open) {
              setOpenWeeks(true);
            }
          }}
          defaultOpen
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Show Weeks</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onPointerDownOutside={() => {
              setOpenWeeks(false);
            }}
            align="end"
            className="max-h-[500px] overflow-y-auto scrollbar-thin"
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const week = column.id as `${string} Wk${number}`;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => {
                      setWeeks(prev =>
                        checked
                          ? [...prev, week].sort()
                          : prev.filter(w => w !== week)
                      );
                    }}
                  >
                    {capitalize(column.id, "_")}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1 text-xs">
          <p>Current Week:</p>
          <p className="text-xs font-semibold">{weeks[getISOWeek(new Date()) - 1]}</p>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-main-100 text-white hover:bg-main-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-primary uppercase font-bold text-xs h-auto py-3 text-center">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} valign="top" className="align-top">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
