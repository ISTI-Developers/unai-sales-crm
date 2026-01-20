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
        site_owner: <SiteOwnerFilter />
    }
    return (
        <div className="text-sm flex flex-col gap-2">
            {deckFilterKeys.filter(key => key !== "search").map(key => {
                const filterKey = key as keyof typeof selectedFilters;
                const filteredToggledOn = selectedFilters[filterKey];
                return <div key={key} className="border-b">
                    <header className="text-xs flex w-full items-center justify-between p-1">
                        <p className="font-semibold text-opacity-60">{capitalize(key, "_")}</p>
                        <Button variant="ghost" className="h-7" size="icon" onClick={() => toggleFilter(key, !!filteredToggledOn)}>
                            {filteredToggledOn ? <Minus size={12} /> : <Plus size={12} />}
                        </Button>
                    </header>
                    {filteredToggledOn &&
                        <main className="p-2 space-y-2">
                            {contentMap[key as keyof typeof contentMap]}
                        </main>
                    }
                </div>
            })}
        </div>
    )
}

export default FiltersContent