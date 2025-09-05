import { MultiComboBox } from "@/components/multicombobox";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List } from "@/interfaces";
import { capitalize } from "@/lib/utils";
import { useReports } from "@/providers/reports.provider";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface Filters<TData> {
  table: Table<TData>;
  data: TData[];
  filters: ColumnFiltersState;
}

type ConditionOptions =
  | "is"
  | "is not"
  | "contains"
  | "does not contain"
  | "is empty"
  | "is not empty";

interface Conditions {
  id: string;
  column: string;
  condition: ConditionOptions | string;
  query: string | List[];
}

function ReportFilters<TData>({ table, data, filters }: Filters<TData>) {
  const { setFilters } = useReports();
  const [conditions, setConditions] = useState<Conditions[]>([]);

  const condition: Conditions = {
    id: v4(),
    column: "",
    condition: "is",
    query: "",
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, condition]);
  };
  const updateCondition = (
    id: string,
    key: keyof typeof condition,
    value: string
  ) => {
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
          if (
            key === "condition" &&
            ["contains", "does not contain"].includes(value)
          ) {
            return {
              ...cond,
              [key]: value as ConditionOptions,
              query: [] as List[],
            };
          }

          return {
            ...cond,
            [key]: key === "condition" ? (value as ConditionOptions) : value,
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
        console.log(filters);
        const filter = filters.find((filter) => filter.id === condition.column);

        // If the filter doesn't exist or has no values, remove the condition
        if (!filter || filter.value.query.length === 0) {
          tempConditions.splice(index, 1);
          hasChanged = true;
        } else {
          // Handle cases where condition.condition is "is" or "contains"
          if (condition.condition === "is") {
            // If the condition is "is", query is a string
            if (filter.value.query[0] !== condition.query) {
              condition.query = filter.value.query[0];
              hasChanged = true;
            }
          } else if (condition.condition === "contains") {
            if (Array.isArray(condition.query)) {
              const updatedQuery = condition.query.filter((q, i) =>
                filter.value.query.includes(q.value)
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
      setFilters(conditions);
      if (conditions.length > 0) {
        conditions.forEach((condition) => {
          if (condition.column !== "") {
            if (condition.query.length !== 0) {
              const { column, query } = condition;

              const queries =
                typeof query === "string" ? [query] : query.map((q) => q.value);

              table.getColumn(column)?.setFilterValue({
                query: queries,
                condition: condition.condition,
              });
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
          className="flex items-center gap-1.5"
        >
          <Filter size={16} />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full" asChild>
        <section className="flex flex-col gap-4 items-start">
          <span className="text-xs border-b w-full pb-2">Filter reports</span>
          {conditions.length > 0 && (
            <div className="flex flex-col gap-2 text-xs">
              <AnimatePresence>
                {conditions.map(({ id, ...item }) => {
                  const isWeek = item.column.includes("Wk");
                  const filteredItems = data.filter(
                    (dItem) => dItem[item.column as keyof typeof dItem]
                  );

                  const flattenedOptions = [
                    ...new Set(
                      filteredItems.map(
                        (fItem) => fItem[item.column as keyof typeof fItem]
                      )
                    ),
                  ]
                    .flat()
                    .sort();
                  const queryConditions = !isWeek
                    ? flattenedOptions.map((fItem, index) => {
                        return {
                          id: String(index),
                          value: fItem,
                          label: capitalize(fItem as string),
                        };
                      })
                    : [];
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1 }}
                      transition={{ type: "tween" }}
                      className="flex items-center gap-1"
                    >
                      <Select
                        value={item.column}
                        onValueChange={(value) =>
                          updateCondition(id, "column", value)
                        }
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {table.getAllColumns().map((column) => {
                            const isVisible = column.getIsVisible();
                            const columnName = capitalize(column.id, "_");
                            return (
                              ![
                                "row",
                                "user",
                                "actions",
                                "name",
                                "brand",
                                "client",
                              ].includes(column.id) &&
                              isVisible && (
                                <SelectItem
                                  value={column.id}
                                  disabled={
                                    conditions.find(
                                      (cond) => cond.column === column.id
                                    ) !== undefined
                                  }
                                >
                                  {columnName}
                                </SelectItem>
                              )
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Select
                        value={item.condition}
                        onValueChange={(value) =>
                          updateCondition(id, "condition", value)
                        }
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "is",
                            "is not",
                            "contains",
                            "does not contain",
                            "is empty",
                            "is not empty",
                          ]
                            .filter((option) =>
                              isWeek
                                ? /empty/.test(option)
                                : !/empty/.test(option)
                            )
                            .map((option) => (
                              <SelectItem value={option} key={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {!/empty/.test(item.condition) && !isWeek && (
                        <>
                          {typeof item.query === "string" ? (
                            <Select
                              value={item.query}
                              onValueChange={(value) =>
                                updateCondition(id, "query", value)
                              }
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Select record" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.column !== "" &&
                                  queryConditions.map((item) => {
                                    return (
                                      <SelectItem
                                        value={item.value as string}
                                        key={item.id}
                                      >
                                        {item.label as string}
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                          ) : (
                            <MultiComboBox
                              title="records"
                              list={queryConditions as List[]}
                              value={item.query}
                              setValue={(itemID, action) => {
                                const item = queryConditions.find(
                                  (option) => String(option.id) === itemID
                                );
                                updateQuery(id, item as List, action);
                              }}
                            />
                          )}
                        </>
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
              size="sm"
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

export default ReportFilters;
