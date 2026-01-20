// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Search from "../search";
// import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ReportFilters from "@/misc/ReportFilters";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import { useReports } from "@/providers/reports.provider";
import { useState } from "react";
import { capitalize } from "@/lib/utils";
import { generateWeeks } from "@/data/reports.columns";
import { getISOWeek } from "date-fns";
import CreateReport from "./create.report";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
interface Config<TData> {
  setValue: (value: string) => void;
  table: Table<TData>;
  data: TData[];
  filters: ColumnFiltersState;
}

function TableConfigurations<TData>({
  setValue,
  data,
  table,
  filters,
}: Config<TData>) {
  const { setVisibleWeeks } = useReports();
  const { pathname } = useLocation();
  const [dropdownVisible, setDropdownVisibility] = useState(false);
  const [openDialog, setOpenDialog] = useState(false)
  return (
    <div className="flex gap-4 items-center flex-wrap flex-grow">
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
          <Button variant="outline">Show Weeks</Button>
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
                  "account_executive",
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
                    {capitalize(column.id, "_")}
                  </DropdownMenuCheckboxItem>
                )
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportFilters data={data} table={table} filters={filters} />
      <div className="flex items-center gap-1 text-[0.6rem]">
        <p>Current Week:</p>
        <p className="text-[0.6rem] font-semibold">{generateWeeks()[getISOWeek(new Date()) - 1]}</p>
      </div>
      {
        !pathname.includes("meetings") && <>
          <Button className="ml-auto" variant="outline" size="sm" onClick={() => setOpenDialog(true)}>Create Report</Button>
          <AnimatePresence>
            {openDialog && (
              <motion.div
                className="fixed inset-0 z-20 flex items-center justify-center bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenDialog(false)} // overlay click
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-md bg-white shadow border p-2 rounded-lg"
                  onClick={(e) => e.stopPropagation()} // prevent close on modal click
                >
                  <CreateReport data={data} open={openDialog} onOpenChange={setOpenDialog} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      }

    </div>
  );
}

export default TableConfigurations;
