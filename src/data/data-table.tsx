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

function TableFilters<TData>({ table, data, filters }: Filters<TData>) {
  const [conditions, setConditions] = useState<Conditions[]>([]);

  const conditionTemplate: Conditions = {
    id: v4(),
    column: "",
    condition: "is",
    query: "",
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, conditionTemplate]);
  };
  const updateCondition = (id: string, key: string, value: string) => {
    setConditions((prev) => {
      const tempConditions = prev.map((cond) => {
        if (cond.id === id) {
          const prevColumn = cond.column;
          if (key === "column" && cond.column !== "") {
            if (prevColumn !== "") {
              table.getColumn(prevColumn)?.setFilterValue(undefined);
            }
            return {
              ...cond,
              [key]: value,
              query: "",
            };
          }
          if (key === "condition" && value === "contains") {
            return {
              ...cond,
              [key]: value,
              query: [],
            };
          }

          return {
            ...cond,
            [key]: value,
          };
        }
        return cond;
      });

      return tempConditions;
    });
  };
  const updateQuery = (id: string, item: List, action?: string) => {
    setConditions((prev) => {
      const tempConditions = prev.map((cond) => {
        if (cond.id === id) {
          // Update the query array based on the action or toggling logic
          if (Array.isArray(cond.query)) {
            const updatedQuery = action // action is always remove so remove the item
              ? cond.query.filter((queryItem: List) => queryItem.id !== item.id) // remove if action is specified
              : cond.query.find((queryItem: List) => queryItem.id === item.id)
              ? cond.query.filter((queryItem: List) => queryItem.id !== item.id) // remove if id already exists
              : [...cond.query, item]; // add id if it doesn't exist

            return {
              ...cond,
              query: updatedQuery,
            };
          }
        }

        return cond;
      });
      return tempConditions;
    });
  };
  const removeCondition = (id: string) => {
    // Get the condition to be removed before filtering
    const conditionToRemove = conditions.find((item) => item.id === id);

    // Update the conditions list
    setConditions((prev) => {
      return prev.filter((item) => item.id !== id);
    });

    // Clear the filter for the removed condition's column
    if (conditionToRemove) {
      table.getColumn(conditionToRemove.column)?.setFilterValue(undefined);
    }
  };
  useEffect(() => {
    setConditions((prev) => {
      // Create a shallow copy of the previous conditions
      const tempConditions = [...prev];

      // If there are no conditions, return early (prevents unnecessary updates)
      if (tempConditions.length === 0) return prev;

      // Flag to track whether any changes were made
      let hasChanged = false;

      tempConditions.forEach((condition, index) => {
        if (condition.column === "" || condition.query.length === 0) {
          return prev;
        }

        // Find the corresponding filter
        const filter = filters.find((filter) => filter.id === condition.column);

        // If the filter doesn't exist or has no values, remove the condition
        if (!filter || filter.value.length === 0) {
          tempConditions.splice(index, 1);
          hasChanged = true;
        } else {
          // Handle cases where condition.condition is "is" or "contains"
          if (condition.condition === "is") {
            // If the condition is "is", query is a string
            if (filter.value[0] !== condition.query) {
              condition.query = filter.value[0];
              hasChanged = true;
            }
          } else if (condition.condition === "contains") {
            if (Array.isArray(condition.query)) {
              const updatedQuery = condition.query.filter((q, i) =>
                filter.value.includes(q.value)
              );

              // Compare the old and new query arrays to determine if there are changes
              if (
                JSON.stringify(updatedQuery) !== JSON.stringify(condition.query)
              ) {
                condition.query = updatedQuery;
                hasChanged = true;
              }
            }
          }
        }
      });

      // If no changes were made, return the previous state to prevent re-renders
      return hasChanged ? tempConditions : prev;
    });
  }, [filters]);

  useEffect(() => {
    const filterTable = () => {
      if (conditions.length > 0) {
        conditions.forEach((condition) => {
          if (condition.column !== "") {
            if (condition.query.length !== 0) {
              const { column, query } = condition;

              const queries =
                typeof query === "string" ? [query] : query.map((q) => q.value);
              table.getColumn(column)?.setFilterValue(queries);
            } else {
              // Revert the filter for the column when condition.query is empty
              table.getColumn(condition.column)?.setFilterValue(undefined);
            }
          }
        });
      } else {
        // Revert all filters when no conditions are provided
        table.getAllColumns().forEach((column) => {
          if (column.id !== "user" && column.id !== "actions") {
            table.getColumn(column.id)?.setFilterValue(undefined);
          }
        });
      }
    };
    filterTable();
  }, [conditions, table]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-600"
        >
          <Filter size={16} />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent asChild className="w-full min-w-[20rem]">
        <section className="flex flex-col gap-4 items-start">
          <span className="text-xs border-b w-full">Filter records</span>
          {conditions.length > 0 && (
            <div className="text-xs flex flex-col gap-4">
              <AnimatePresence>
                {conditions.map(({ id, ...condition }) => {
                  const filteredItems = data.filter(
                    (item) => item[condition.column] !== null
                  );
                  let flattenedOptions = [
                    ...new Set(
                      filteredItems.map((item) => item[condition.column])
                    ),
                  ].flat();

                  if (condition.column === "mediums") {
                    flattenedOptions = [
                      ...new Map(
                        flattenedOptions.map((item) => [
                          item.medium_id,
                          { id: item.medium_id, name: item.name },
                        ])
                      ).values(),
                    ];
                  }

                  if (condition.column === "companies") {
                    flattenedOptions = [
                      ...new Map(
                        flattenedOptions.map((item) => [
                          item.ID,
                          { id: item.ID, name: item.code },
                        ])
                      ).values(),
                    ];
                  }

                  const queryConditions = flattenedOptions.map(
                    (item, index) => {
                      if (["mediums", "companies"].includes(condition.column)) {
                        return {
                          id: String(item.id),
                          value: item.name,
                          label: item.name,
                        };
                      } else {
                        return {
                          id: String(index),
                          value: item,
                          label: item,
                        };
                      }
                    }
                  );
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1 }}
                      transition={{ type: "tween" }}
                      key={id}
                      className="flex items-center gap-3"
                    >
                      <Select
                        value={condition.column ?? null}
                        onValueChange={(value) =>
                          updateCondition(id, "column", value)
                        }
                      >
                        <SelectTrigger className="min-w-[180px] capitalize">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {table.getAllColumns().map((column) => {
                            const columnName = column.id.includes("name")
                              ? column.id.split("_")[0]
                              : column.id;
                            return (
                              !["user", "actions", "name", "brand"].includes(
                                column.id
                              ) && (
                                <SelectItem
                                  key={column.id}
                                  value={column.id}
                                  className="capitalize"
                                  disabled={
                                    conditions.find(
                                      (cond) => cond.column === column.id
                                    ) !== undefined
                                  }
                                >
                                  {columnName.replace(/_/g, " ")}
                                </SelectItem>
                              )
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Select
                        value={condition.condition}
                        onValueChange={(value) =>
                          updateCondition(id, "condition", value)
                        }
                      >
                        <SelectTrigger className="w-fit">
                          <SelectValue placeholder="filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="is">is</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                        </SelectContent>
                      </Select>
                      {typeof condition.query === "string" ? (
                        <Select
                          value={condition.query}
                          onValueChange={(value) =>
                            updateCondition(id, "query", value)
                          }
                        >
                          <SelectTrigger className="w-fit">
                            <SelectValue placeholder="Select record" />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.column !== "" &&
                              queryConditions.map((item) => {
                                return (
                                  <SelectItem value={item.value} key={item.id}>
                                    {item.label}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <MultiComboBox
                          title="records"
                          list={queryConditions}
                          value={condition.query}
                          setValue={(itemID, action) => {
                            const item = queryConditions.find(
                              (option) => String(option.id) === itemID
                            );
                            updateQuery(id, item, action);
                          }}
                        />
                      )}
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="rounded-full h-fit p-1 text-gray-400 hover:text-gray-500"
                        onClick={() => removeCondition(id)}
                      >
                        <X size={16} />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
          <div className="w-full flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="space-x-1.5"
              onClick={addCondition}
              disabled={
                conditions.length ===
                table
                  .getAllColumns()
                  .filter((col) => !["user", "actions"].includes(col.id)).length
              }
            >
              <PlusCircle size={14} />
              <span className="text-xs">Add condition</span>
            </Button>
          </div>
        </section>
      </PopoverContent>
    </Popover>
  );
}
