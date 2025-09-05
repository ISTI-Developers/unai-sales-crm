import { useSitelandmarks } from "@/hooks/useSites";
import { List } from "@/interfaces";
import { useDeck } from "@/providers/deck.provider";
import { useMemo } from "react";
import { MultiComboBox } from "../multicombobox";
import { capitalize } from "@/lib/utils";

const LandmarkFilter = () => {
  const { setFilters, filters } = useDeck();
  const { data, isLoading } = useSitelandmarks();
  const list: List[] = useMemo(() => {
    if (isLoading || !data) return [];

    const types = data
      .map((lm) => {
        return [...lm.types];
      })
      .flat();

    const interestList = [...new Set(types)];

    return interestList.map((item) => {
      return {
        id: item,
        label: capitalize(item, "_"),
        value: item,
      };
    });
  }, [data, isLoading]);
  return (
    <>
      <MultiComboBox
        list={list}
        title="landmarks"
        value={filters.landmarks ?? []}
        setValue={(id) =>
          setFilters((prev) => {
            const current = prev.landmarks ?? [];
            const exists = current.some((item) => item.id === id);

            if (exists) {
              // Remove if already selected
              return {
                ...prev,
                landmarks: current.filter((item) => item.id !== id),
              };
            }

            // Add if not selected
            const found = list.find((item) => item.id === id);
            return found
              ? {
                  ...prev,
                  landmarks: [...current, found],
                }
              : prev;
          })
        }
      />
    </>
  );
};

export default LandmarkFilter;
