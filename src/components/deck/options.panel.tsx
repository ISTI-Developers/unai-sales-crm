import { deckOptionKeys, displayOptions, optionsBaseContent } from "@/interfaces/deck.interface"
import { capitalize } from "@/lib/utils";
import { useDeck } from "@/providers/deck.provider";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { lazy, Suspense } from "react";

const PriceAdjustmentOption = lazy(() => import("@/components/deck/options.price"))
const CurrencyExchangeOption = lazy(() => import("@/components/deck/options.currency"))
const RatesGeneratorOption = lazy(() => import("@/components/deck/options.rate"))
const DisplayOption = lazy(() => import("@/components/deck/options.display"))

const OptionsPanel = () => {
    const { selectedSites, selectedOptions, setOptions } = useDeck();


    const toggleFilter = (key: string, remove: boolean) => {
        setOptions(prev => {
            if (!prev) return prev;

            if (remove) {
                // Remove the key from filters
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [key as keyof typeof prev]: _, ...rest } = prev;
                if (key === "rate_generator" && selectedOptions.display_options) {
                    return { ...rest, display_options: displayOptions.base }
                }
                return rest;
            }
            if (key === "display_options") {
                if (selectedOptions.rate_generator) {
                    return { ...prev, [key]: displayOptions.withRateGenerator }
                }
                return { ...prev, [key]: displayOptions.base }
            }
            if (key === "rate_generator" && selectedOptions.display_options) {
                return { ...prev, [key]: optionsBaseContent[key as keyof typeof optionsBaseContent], display_options: displayOptions.withRateGenerator }
            }
            return { ...prev, [key]: optionsBaseContent[key as keyof typeof optionsBaseContent] }
        })
    }

    const contentMap = {
        price_adjustment: <PriceAdjustmentOption />,
        rate_generator: <RatesGeneratorOption />,
        currency_exchange: <CurrencyExchangeOption />,
        display_options: <DisplayOption />,
    }
    if (selectedSites.length === 0) return <div className="space-y-2">
        <h1 className="font-bold uppercase text-xs">Deck Options</h1>
        <div className="w-full h-full bg-zinc-200 p-4 py-12 rounded flex items-center justify-center">
            <p className="text-zinc-400 text-center font-semibold">Please select atleast one (1) site to configure.</p>
        </div>
    </div>
    if (!selectedOptions) return;
    return (
        <>
            <h1 className="font-bold uppercase text-xs">Deck Options</h1>
            <div className="text-sm flex flex-col gap-2">
                {deckOptionKeys.map((key) => {
                    const option = key as keyof typeof selectedOptions;
                    const optionToggledOn = selectedOptions[option];
                    return <div key={key} className="border-b w-full">
                        <header className="text-xs flex w-full items-center justify-between p-0.5 h-7">
                            <p className="font-semibold text-[0.65rem] text-opacity-60">{capitalize(key, "_")}</p>
                            <Button variant="ghost" className="h-7 w-7 hover:bg-zinc-200" size="icon" onClick={() => toggleFilter(key, !!optionToggledOn)}>
                                {optionToggledOn ? <Minus size={12} /> : <Plus size={12} />}
                            </Button>
                        </header>
                        {optionToggledOn &&
                            <main className="p-1 flex flex-col gap-1">
                                <Suspense fallback={<>Loading...</>}>
                                    {contentMap[key as keyof typeof contentMap]}
                                </Suspense>
                            </main>
                        }
                    </div>
                })}
            </div>
        </>
    )
}

export default OptionsPanel