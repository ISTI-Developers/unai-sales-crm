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
import { generateWeeks } from "@/data/reports.columns";
import { ColumnFiltersState, Table as T } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

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
          className="flex items-center gap-1.5"
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
                              ![
                                "user",
                                "actions",
                                "name",
                                "brand",
                                "client",
                                ...generateWeeks(),
                              ].includes(column.id) && (
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

export default TableFilters;
