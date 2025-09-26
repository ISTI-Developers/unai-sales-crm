import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDeck } from "@/providers/deck.provider";

import { format, getYear } from "date-fns";
import { MultiComboBox } from "../multicombobox";
import { List } from "@/interfaces";

const AvailabilityFilter = () => {
  const { setFilters, filters, availability, setAvailability } = useDeck();

  const options: List[] = Array.from({ length: 24 }, (_, index) =>
    format(new Date(getYear(new Date()), index), "MMMM yyyy")
  ).map((item, index) => {
    return {
      id: String(index),
      label: item,
      value: item,
    };
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <p className="text-xs">Show: </p>
        <Select
          onValueChange={setAvailability}
          value={availability}
          defaultValue="all"
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="range">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {availability === "range" && (
        <div className="flex items-center gap-2">
          <p className="text-xs">Select: </p>
          <MultiComboBox
            list={options}
            title="months"
            value={filters.availability ?? []}
            setValue={(id) =>
              setFilters((prev) => {
                const current = prev.availability ?? [];
                const exists = current.some((item) => item.id === id);

                if (exists) {
                  // Remove if already selected
                  return {
                    ...prev,
                    availability: current.filter((item) => item.id !== id),
                  };
                }

                // Add if not selected
                const found = options.find((item) => item.id === id);
                return found
                  ? {
                      ...prev,
                      availability: [...current, found],
                    }
                  : prev;
              })
            }
          />
        </div>
      )}
    </>
  );
};

export default AvailabilityFilter;
