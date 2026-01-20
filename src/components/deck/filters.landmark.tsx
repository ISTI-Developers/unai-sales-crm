import { useSitelandmarks } from "@/hooks/useSites";
import { List } from "@/interfaces";
import { useDeck } from "@/providers/deck.provider";
import { useMemo } from "react";
import { MultiComboBox } from "../multicombobox";
import { capitalize } from "@/lib/utils";

const LandmarkFilter = () => {
    const { setFilters, selectedFilters } = useDeck();
    const { data, isLoading } = useSitelandmarks();

    const selectedLandmarks: List[] = useMemo(() => {
        if (!selectedFilters) return [];
        if (!selectedFilters.landmark) return [];

        return selectedFilters.landmark.map((item) => {
            return {
                id: item,
                label: item,
                value: item,
            };
        })

    }, [selectedFilters])

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
                value={selectedLandmarks}
                setValue={(id) =>
                    setFilters((prev) => {
                        if (!prev) return prev;

                        const current = prev.landmark ?? [];
                        const exists = current.some((item) => item === id);

                        if (exists) {
                            // Remove if already selected
                            return {
                                ...prev,
                                landmark: current.filter((item) => item !== id),
                            };
                        }

                        // Add if not selected
                        const found = list.find((item) => item.id === id);
                        return found
                            ? {
                                ...prev,
                                landmark: [...current, found.value],
                            }
                            : prev;
                    })
                }
            />
        </>
    );
};

export default LandmarkFilter;
