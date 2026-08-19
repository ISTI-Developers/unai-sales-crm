import AddOn from "@/components/deck/addOn.deck";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useDeck } from "@/providers/deck.provider";
import { AnimatePresence, motion } from "framer-motion";
import { BadgePercentIcon, ChevronsLeftIcon, CircleDollarSignIcon, ImagesIcon, MonitorIcon, PackagePlusIcon, PanelsTopLeftIcon, Settings2Icon } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";


const SiteSelection = lazy(() => import("@/components/deck/sites.selection"))
const DeckImageOptions = lazy(() => import("@/pages/deck/images.deck"))
const CurrencyExchangeOption = lazy(() => import("@/components/deck/options.currency"))
const PriceAdjustmentOption = lazy(() => import("@/components/deck/options.price"))
const RatesGeneratorOption = lazy(() => import("@/components/deck/options.rate"))
const DeckSettings = lazy(() => import("@/components/deck/settings.deck"))

function DeckToolbar() {
    const { option, setOption, selectedOptions, selectedSites } = useDeck()
    const isMobile = useIsMobile();
    const tabs = {
        site_selection: {
            icon: MonitorIcon,
            label: "Sites",
            content: <SiteSelection />
        },
        images: {
            icon: ImagesIcon,
            label: "Images",
            content: <DeckImageOptions />
        },
        rates_adjustment: {
            icon: BadgePercentIcon,
            label: "Rates Adjustment",
            content: <PriceAdjustmentOption />
        },
        rate_terms: {
            icon: PanelsTopLeftIcon,
            label: "Rate Terms",
            content: <RatesGeneratorOption />
        },
        currency_exchange: {
            icon: CircleDollarSignIcon,
            label: "Currency Exchange",
            content: <CurrencyExchangeOption />
        },
        add_ons: {
            icon: PackagePlusIcon,
            label: "Add Ons",
            content: <AddOn />
        },
        settings: {
            icon: Settings2Icon,
            label: "Settings",
            content: <DeckSettings />
        },
    } as const;

    const isRateGeneratorDisabled = useMemo(() => {
        const { rate_basis, booking_terms } = selectedOptions.settings;

        return rate_basis === "SINGLE" && booking_terms[0].duration === 1
    }, [selectedOptions])
    return (
        <nav
            className={cn(
                "fixed z-[30] lg:z-[1] bottom-0 w-full lg:relative lg:flex lg:w-auto lg:shrink-0 lg:items-start border-r shadow bg-white",
                "transition-all",
            )}
        >
            <div className="flex lg:flex-col p-2 lg:gap-2 justify-evenly w-full overflow-y-auto lg:w-fit snap-x snap-mandatory">
                {Object.entries(tabs).map(([key, tab]) => {
                    return <div role="button" data-disabled={(key === "rate_terms" && isRateGeneratorDisabled) || (key === "images" && selectedSites.length === 0)} onClick={() => {
                        if (isRateGeneratorDisabled && key === "rate_terms") return;
                        setOption(prev => {
                            if (prev === key) return undefined;
                            return key
                        })
                    }} key={tab.label} className={cn("grid grid-rows-2 justify-center place-items-center min-w-[5rem] lg:min-w-0 snap-start transition-all rounded-xl",
                        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                    )}>
                        <div className={cn("lg:p-1.5 transition-all lg:rounded-lg", option === key ? "bg-main-500 text-white" : "")}>
                            <tab.icon className="size-4" />
                        </div>
                        <div className="text-[0.6rem] lg:text-[0.65rem] text-center max-w-[75px] leading-tight">{tab.label}</div>
                    </div>
                })}
            </div>
            {isMobile ?
                <Sheet modal={false} open={option !== undefined} onOpenChange={(open) => {
                    if (!open) {
                        setOption(undefined)
                    }
                }}>
                    {option &&
                        <SheetContent side="bottom" aria-describedby={undefined} className="h-[min(60vh,600px)] z-[40]" tabIndex={-1}>
                            <Suspense fallback={<>Loading options</>}>
                                {tabs[option as keyof typeof tabs].content}
                            </Suspense>
                        </SheetContent>
                    }
                </Sheet>
                :
                <AnimatePresence>
                    {option && (
                        <motion.section
                            key="option-panel"
                            data-mobile={isMobile}
                            className="relative h-full w-[18vw]"
                            initial={{ width: 0, opacity: 0, x: -20 }}
                            animate={{ width: "20vw", opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: -20 }}
                            transition={{
                                duration: 0.25,
                                ease: "easeInOut",
                            }}

                        >
                            <header />
                            <div className="scrollbar-none h-full max-h-[70vh] p-2 pl-0 space-y-2">
                                <Suspense fallback={<>Loading options</>}>
                                    {tabs[option as keyof typeof tabs].content}
                                </Suspense>
                            </div>
                            <Button
                                className="absolute top-1/2 -right-2 -translate-y-1/2 bg-white p-0 px-0.5"
                                onClick={() => setOption(undefined)}
                                variant="outline"
                                size="sm"
                            >
                                <ChevronsLeftIcon />
                            </Button>
                        </motion.section>
                    )}
                </AnimatePresence>
            }
        </nav>
    )
}

export default DeckToolbar