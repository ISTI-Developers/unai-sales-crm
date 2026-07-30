/* eslint-disable @typescript-eslint/no-unused-vars */
import { deckFilterKeys } from "@/interfaces/deck.interface"
import { capitalize } from "@/lib/utils"
import { Button } from "../ui/button"
import { Minus, Plus } from "lucide-react"
import { useDeck } from "@/providers/deck.provider"
import AreaFilter from "./filters.area"
import AvailabilityFilter from "./filters.availability"
import LandmarkFilter from "./filters.landmark"
import PriceFilter from "./filters.price"
import SiteOwnerFilter from "./filters.siteOwner"
import SiteStatus from "./filters.siteStatus"

const FiltersContent = () => {
    const { selectedFilters, setFilters } = useDeck();

    const toggleFilter = (key: string, remove: boolean) => {
        setFilters(prev => {
            if (!prev) return prev;

            if (remove) {
                // Remove the key from filters
                const { [key as keyof typeof prev]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [key]: [] }
        })
    }
    if (!selectedFilters) return;

    const contentMap = {
        area: <AreaFilter />,
        availability: <AvailabilityFilter />,
        landmark: <LandmarkFilter />,
        price: <PriceFilter />,
        site_owner: <SiteOwnerFilter />,
        status: <SiteStatus />
    }
    return (
        <div className="space-y-2">
            {deckFilterKeys
                .filter(key => key !== "search")
                .map(key => {
                    const filterKey = key as keyof typeof selectedFilters;
                    const isOpen = !!selectedFilters[filterKey];

                    return (
                        <div
                            key={key}
                            className="overflow-hidden rounded-lg border bg-background"
                        >
                            <button
                                type="button"
                                onClick={() => toggleFilter(key, isOpen)}
                                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-100"
                            >
                                <span className="text-sm font-medium">
                                    {capitalize(key, "_")}
                                </span>

                                <div className="rounded-full bg-muted p-1">
                                    {isOpen ? (
                                        <Minus size={14} />
                                    ) : (
                                        <Plus size={14} />
                                    )}
                                </div>
                            </button>

                            {isOpen && (
                                <div className=" px-4 py-3">
                                    {contentMap[key as keyof typeof contentMap]}
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    )
}

export default FiltersContent