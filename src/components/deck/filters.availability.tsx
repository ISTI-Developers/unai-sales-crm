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
import { useMemo } from "react";

const AvailabilityFilter = () => {
  const { setFilters, selectedFilters } = useDeck();


  // Generate "January 2025", "February 2025", etc.
  const options: List[] = Array.from({ length: 24 }, (_, index) => {
    const label = format(new Date(getYear(new Date()), index), "MMMM yyyy");
    return {
      id: label,
      label,
      value: label,
    };
  });

  const selectedDates: List[] = useMemo(() => {
    if (!selectedFilters.availability) return [];
    const availability = selectedFilters.availability.map((x) =>
      x.toLowerCase()
    );

    if (!availability.includes("range")) return [];

    return selectedFilters.availability
      .filter((v) => !["all", "open", "booked", "range"].includes(v))
      .map((item) => ({
        id: item,
        label: item,
        value: item,
      }));
  }, [selectedFilters]);

  if (!selectedFilters?.availability) return null;
  const currentAvailability =
    (selectedFilters.availability[0] ?? "").toLowerCase();

  return (
    <>
      <div className="flex items-center gap-2">
        <p className="text-xs">Show: </p>

        <Select
          value={currentAvailability}
          onValueChange={(value) =>
            setFilters((prev) => {
              if (!prev) return prev;

              return {
                ...prev,
                availability: [value],
              };
            })
          }
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
      {selectedFilters.availability.includes("range") && (
        <div className="flex items-center gap-2">
          <MultiComboBox
            list={options}
            title="dates"
            value={selectedDates}
            setValue={(id) =>
              setFilters((prev) => {
                if (!prev) return prev;

                const current = prev.availability ?? [];
                const exists = current.includes(id);

                if (exists) {
                  return {
                    ...prev,
                    availability: current.filter((item) => item !== id),
                  };
                }

                // add item
                return {
                  ...prev,
                  availability: [...current, id],
                };
              })
            }
          />
        </div>
      )}
    </>
  );
};

export default AvailabilityFilter;
