import { useSiteCities } from "@/hooks/useSites";
import { MultiComboBox } from "../multicombobox";
import { useMemo } from "react";
import { List } from "@/interfaces";
import { useDeck } from "@/providers/deck.provider";

const AreaFilter = () => {
  const { setFilters, filters } = useDeck();
  const { data, isLoading } = useSiteCities();
  const list: List[] = useMemo(() => {
    if (isLoading || !data) return [];
    return data.map((item) => {
      return {
        id: String(item.city_id),
        label: item.city_name,
        value: item.city_name,
      };
    });
  }, [data, isLoading]);

  return (
    <>
      <MultiComboBox
        list={list}
        title="areas"
        value={filters.area ?? []}
        setValue={(id) =>
          setFilters((prev) => {
            const current = prev.area ?? [];
            const exists = current.some((item) => item.id === id);

            if (exists) {
              // Remove if already selected
              return {
                ...prev,
                area: current.filter((item) => item.id !== id),
              };
            }

            // Add if not selected
            const found = list.find((item) => item.id === id);
            return found
              ? {
                  ...prev,
                  area: [...current, found],
                }
              : prev;
          })
        }
      />
    </>
  );
};

export default AreaFilter;
