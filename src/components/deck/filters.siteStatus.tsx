import { useSites } from '@/hooks/useSites';
import { List } from '@/interfaces';
import { useDeck } from '@/providers/deck.provider'
import { useMemo } from 'react';
import { MultiComboBox } from '../multicombobox';

const SiteStatus = () => {
    const { setFilters, selectedFilters } = useDeck();
    const { data, isLoading } = useSites()

    const statusMap = new Map([
        [1, { id: 1, label: "active", action: "reactivate" }],
        [2, { id: 2, label: "inactive", action: "deactivate" }],
        [3, { id: 3, label: "Under Construction", action: "Under Construction" }],
        [5, { id: 5, label: "dismantled", action: "dismantle" }],
    ])

    const selectedStatuses: List[] = useMemo(() => {
        if (!selectedFilters) return [];
        if (!selectedFilters.status) return [];

        return selectedFilters.status.map((item) => {
            return {
                id: String(item),
                label: statusMap.get(item)?.label ?? "",
                value: String(item),
            };
        })

    }, [selectedFilters])

    const list: List[] = useMemo(() => {
        if (isLoading || !data) return [];

        const siteStatuses = [...new Set(data.map(item => item.status))];
        return siteStatuses.map((item) => {
            return {
                id: String(item),
                label: statusMap.get(item)?.label ?? "",
                value: String(item),
            };
        });
    }, [data, isLoading]);

    return (
        <>
            <MultiComboBox
                list={list}
                title="status"
                value={selectedStatuses}
                setValue={(id) =>
                    setFilters((prev) => {
                        if (!prev) return prev;

                        const current = prev.status ?? [];
                        const exists = current.some((item) => item === Number(id));

                        if (exists) {
                            // Remove if already selected
                            return {
                                ...prev,
                                status: current.filter((item) => item !== Number(id)),
                            };
                        }

                        // Add if not selected
                        const found = list.find((item) => item.id === id);
                        return found
                            ? {
                                ...prev,
                                status: [...current, Number(found.value)],
                            }
                            : prev;
                    })
                }
            />
        </>
    )
}

export default SiteStatus