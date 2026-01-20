import { useSiteCities } from '@/hooks/useSites';
import { List } from '@/interfaces';
import { useDeck } from '@/providers/deck.provider'
import { useMemo } from 'react';
import { MultiComboBox } from '../multicombobox';

const AreaFilter = () => {
    const { setFilters, selectedFilters } = useDeck();
    const { data, isLoading } = useSiteCities();

    const selectedAreas: List[] = useMemo(() => {
        if (!selectedFilters) return [];
        if (!selectedFilters.area) return [];

        return selectedFilters.area.map((item) => {
            return {
                id: item,
                label: item,
                value: item,
            };
        })

    }, [selectedFilters])

    const list: List[] = useMemo(() => {
        if (isLoading || !data) return [];
        return data.map((item) => {
            return {
                id: item.city_name,
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
                value={selectedAreas}
                setValue={(id) =>
                    setFilters((prev) => {
                        if (!prev) return prev;

                        const current = prev.area ?? [];
                        const exists = current.some((item) => item === id);

                        if (exists) {
                            // Remove if already selected
                            return {
                                ...prev,
                                area: current.filter((item) => item !== id),
                            };
                        }

                        // Add if not selected
                        const found = list.find((item) => item.id === id);
                        return found
                            ? {
                                ...prev,
                                area: [...current, found.value],
                            }
                            : prev;
                    })
                }
            />
        </>
    )
}

export default AreaFilter