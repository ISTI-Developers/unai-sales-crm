import { Input } from "./ui/input";
import TableFilters from "@/misc/TableFilters";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import { useLocation } from "react-router-dom";
import Search from "./search";

interface TableOptions<TData> {
  setGlobalFilter: Dispatch<SetStateAction<string>>;
  table: Table<TData>;
  data: TData[];
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
}

const TableOptions = <TData,>({
  setGlobalFilter,
  table,
  data,
  columnFilters,
  setColumnFilters,
}: TableOptions<TData>) => {
  const { pathname } = useLocation();
  return (
    <div className="flex items-center gap-4">
      <Search setValue={(value) => setGlobalFilter(value)} />
      <TableFilters table={table} data={data} filters={columnFilters} />
      {columnFilters.length > 0 && (
        <div className="flex items-center bg-base p-1 px-2 rounded-md gap-2">
          {columnFilters.map((column, index) => {
            return (
              <div key={column.id} className="flex items-center gap-2 text-sm">
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

                          if (finalFilters.length === 0) {
                            localStorage.setItem(
                              `f${pathname}`,
                              JSON.stringify(finalFilters)
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
  );
};

export default TableOptions;
