import { useSites } from '@/hooks/useSites';
import { List } from '@/interfaces';
import { useDeck } from '@/providers/deck.provider'
import { useMemo } from 'react';
import { MultiComboBox } from '../multicombobox';

const SiteOwnerFilter = () => {
    const { setFilters, selectedFilters } = useDeck();
    const { data, isLoading } = useSites()

    const selectedSiteOwners: List[] = useMemo(() => {
        if (!selectedFilters) return [];
        if (!selectedFilters.site_owner) return [];

        return selectedFilters.site_owner.map((item) => {
            return {
                id: item,
                label: item,
                value: item,
            };
        })

    }, [selectedFilters])

    const list: List[] = useMemo(() => {
        if (isLoading || !data) return [];

        const siteOwners = [...new Set(data.map(item => item.site_owner))];
        return siteOwners.map((item) => {
            return {
                id: item,
                label: item,
                value: item,
            };
        });
    }, [data, isLoading]);

    return (
        <>
            <MultiComboBox
                list={list}
                title="site owner"
                value={selectedSiteOwners}
                setValue={(id) =>
                    setFilters((prev) => {
                        if (!prev) return prev;

                        const current = prev.site_owner ?? [];
                        const exists = current.some((item) => item === id);

                        if (exists) {
                            // Remove if already selected
                            return {
                                ...prev,
                                site_owner: current.filter((item) => item !== id),
                            };
                        }

                        // Add if not selected
                        const found = list.find((item) => item.id === id);
                        return found
                            ? {
                                ...prev,
                                site_owner: [...current, found.value],
                            }
                            : prev;
                    })
                }
            />
        </>
    )
}

export default SiteOwnerFilter