import Search from "../search";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Table } from "@tanstack/react-table";
import { useReports } from "@/providers/reports.provider";
import { useMemo, useState } from "react";
import { generateWeeks } from "@/lib/utils";
import { format } from "date-fns";
interface Config<TData> {
  setValue: (value: string) => void;
  table: Table<TData>;
}

function TableConfigurations<TData>({
  setValue,
  table,
}: Config<TData>) {
  const { setVisibleWeeks } = useReports();
  const [dropdownVisible, setDropdownVisibility] = useState(false);

  const currentWeek = useMemo(() => generateWeeks().find(week => week.isCurrent)!, []);
  return (
    <div className="flex gap-4 items-center flex-wrap w-full">
      <Search setValue={setValue} />
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
          <Button variant="outline" className="h-7">Show Weeks</Button>
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
                ![
                  "client",
                  "account_executives",
                  "sales_unit",
                  "status",
                ].includes(column.id) && (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => {
                      setVisibleWeeks((prev) => {
                        return {
                          ...prev,
                          [column.id as keyof typeof prev]: !!value,
                        };
                      });
                      column.toggleVisibility(!!value);
                    }}
                  >
                    {column.columnDef.header as string}
                  </DropdownMenuCheckboxItem>
                )
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-1 text-xs">
        <p>Current Period:</p>
        <p className="font-semibold">Wk{currentWeek.isoWeek}</p>
        <p>|</p>
        <p className="font-semibold">{`${format(currentWeek.start, "MMM dd")} - ${format(currentWeek.end, "MMM dd")}`}</p>
      </div>
    </div>
  );
}

export default TableConfigurations;
