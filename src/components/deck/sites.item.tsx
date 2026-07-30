import { DeckSite, regions } from "@/interfaces/deck.interface";
import { cn } from "@/lib/utils";
import SiteImages from "./sites.images";
import { Landmarks } from "@/interfaces/sites.interface";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getSiteLandmarks, useMap } from "@/hooks/useSites";
import { format, isBefore, subDays } from "date-fns";
import { applyPriceAdjustment, formatAmount, formatNumber } from "@/lib/format";
import { useDeck } from "@/providers/deck.provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useGeneratePowerpoint } from "@/hooks/usePrint";
import classNames from "classnames";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { AddOn } from "@/misc/deckTemplate";
import { createMapURL } from "./helpers.deck";

export const SiteItem = ({ item, className }: { item: DeckSite; className?: string }) => {
    const { setSelectedSites } = useDeck()
    const availability = useMemo(() => {
        if (!item?.availability) return "N/A";

        if (item.is_prime) {
            const rofrDate = subDays(new Date(item.availability), 61);
            if (isBefore(rofrDate, new Date())) {
                return 'N/A'
            }
            return format(rofrDate, "PP");
        }

        const rofrDate = subDays(new Date(item.availability), 31);
        if (isBefore(rofrDate, new Date())) {
            return 'N/A'
        }
        return format(rofrDate, "PP");
    }, [item?.availability, item?.is_prime])

    return item && (
        <div
            key={item.site_code}
            id={item.site_code}
            className={cn(
                "relative group w-full h-full bg-white overflow-hidden",
                className
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="relative w-full h-[clamp(20px,4.5vh,100px)] bg-main-500 flex items-center justify-between px-4">
                <img src="/unai-w.png" alt="" className="w-[clamp(70px,4vw,200px)] p-2 px-0" />
                <p className="text-white font-semibold text-sm">
                    {`Billboard Site in ${item.city}`}
                </p>
                <Button type="button" onClick={() => {
                    setSelectedSites(prev => {
                        return prev.filter(p => p.ID !== item.ID)
                    })
                }} className="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-all" variant="destructive" size={"icon"}>
                    <Trash2 />
                </Button>
            </div>
            <div className="grid grid-cols-[1.75fr_1fr] pb-8 h-full">
                <SiteImages site_code={item.site_code} selectedImage={item.image} />
                {/* BASIC INFO */}
                <div className="py-2 lg:py-4 grid grid-cols-2 h-fit gap-0.5 lg:gap-y-2 gap-x-4 pr-3">
                    <div className="flex gap-0.5 items-end">
                        <DeckLabel>
                            Availability
                        </DeckLabel>
                        <AvailabilityField site={item} />
                    </div>
                    <div className="flex gap-0.5 items-end">
                        <DeckLabel>
                            ROFR
                        </DeckLabel>
                        <DeckValue>{availability}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Site Code
                        </DeckLabel>
                        <DeckValue>{item.site_code}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Size (H x W)
                        </DeckLabel>
                        <DeckValue>{item.size}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Address
                        </DeckLabel>
                        <DeckValue>{item.address}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Facing
                        </DeckLabel>
                        <DeckValue>{item.board_facing}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Bound
                        </DeckLabel>
                        <DeckValue>{item.bound}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Traffic Count
                        </DeckLabel>
                        <DeckValue>{formatNumber(item.traffic_count ?? 0)}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Population
                        </DeckLabel>
                        <DeckValue>{formatNumber(item.vicinity_population ?? 0)}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Landmarks
                        </DeckLabel>
                        <LandmarkField site={item} />
                    </div>
                    <PriceField site={item} />
                    <div className="leading-none col-[1/3]">
                        <DeckValue className="text-[11px] relative">
                            <MapField site_code={item.site_code} latitude={item.latitude} longitude={item.longitude} ideal_view={item.ideal_view} />
                        </DeckValue>
                    </div>
                </div>

            </div>
        </div>
    );
};

const PriceField = ({ site }: { site: DeckSite }) => {
    const { selectedOptions } = useDeck();
    const { applyOptions, applyExchangeRate } = useGeneratePowerpoint();
    const updatedPrice = applyOptions(site, site.price, Number(site.price));
    const settings = selectedOptions.settings;

    const addOns = useMemo(() => {
        if (!selectedOptions.add_ons) return new Map<string, AddOn>([]);

        return new Map<string, AddOn>(selectedOptions.add_ons.map(addOn => [addOn.key, addOn]))
    }, [selectedOptions])

    const bookingTerms = useMemo(() => {
        return settings.booking_terms.map(term => term.duration);
    }, [settings.booking_terms])

    const materialPrinting = addOns.get("material_printing")
    const installationDismantling = addOns.get("installation_dismantling")
    const hasInstallation = Object.values(
        installationDismantling?.rates ?? {}
    ).some(rate => rate.value > 0);
    const hasMaterial = Object.values(
        materialPrinting?.rates ?? {}
    ).some(rate => rate.value > 0);

    const printingCost = useMemo(() => {
        const production_cost = selectedOptions.settings.printing_cost;
        const prefix = Number(site.site_code.substring(0, 1)) as keyof typeof regions;
        const rate = production_cost[regions[prefix] as keyof typeof production_cost]

        const dims = site.size
            .match(/\d+(\.\d+)?/g)
            ?.map(Number)

        const cost = dims?.reduce((acc, n) => acc * n, rate) ?? 0

        return applyExchangeRate(cost, selectedOptions.currency_exchange.equivalent);

    }, [applyExchangeRate, selectedOptions.currency_exchange.equivalent, selectedOptions.settings.printing_cost, site.site_code, site.size])

    return <div className={cn("leading-none flex flex-col gap-1 col-[1/3]")}>
        {settings.rate_basis === "SINGLE"
            ?
            <div className="flex gap-2">
                <div>
                    <DeckLabel className="text-[#000] font-bold">Monthly Rate</DeckLabel>
                    <DeckValue className={cn("text-[clamp(7px,1vw,11px)] flex flex-col")}>
                        <p>{`${formatAmount(updatedPrice, {
                            style: "currency",
                            currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                        })} + VAT`}</p>
                        <p className="font-normal lowercase space-x-1 text-[10px] leading-normal">
                            {bookingTerms.map(term => {
                                const materialRate = materialPrinting?.rates[term];
                                const installationRate = installationDismantling?.rates[term];

                                const freebies = [];

                                if (installationRate && installationRate.value !== 0) {
                                    freebies.push(`${installationRate.value}x installation`)
                                }
                                if (materialRate?.type === "FREE" && materialRate.value !== 0) {
                                    freebies.push(`${materialRate.value}x material`)
                                }

                                return freebies.length > 0 && <span key={term}>
                                    {`w/ free ${freebies.join(" & ")}`}
                                </span>
                            })}
                        </p>
                    </DeckValue>
                </div>
                {materialPrinting?.rates[1].value === 0 &&
                    <div>
                        <DeckLabel className="text-[#000] font-bold">Production Cost</DeckLabel>
                        <DeckValue className={cn("text-[clamp(7px,1vw,11px)] flex flex-col")}>
                            <p>{`${formatAmount(printingCost, {
                                style: "currency",
                                currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                            })}`}</p>
                        </DeckValue>
                    </div>}
            </div>
            :
            <div>
                <DeckValue className="font-normal">
                    <table className="border-collapse border w-full">
                        <thead>
                            <tr className="text-[clamp(3px,1vw,7px)]">
                                <th>Month</th>
                                <th>Monthly Rate</th>
                                {hasMaterial && <th>Material</th>}
                                {hasInstallation && <th>Installation</th>}
                            </tr>
                        </thead>
                        <tbody className="text-center text-[clamp(4px,1vw,7px)]">
                            {bookingTerms.map(term => {
                                const materialRate = materialPrinting?.rates[term];
                                const installationRate = installationDismantling?.rates[term];
                                const adjustment = selectedOptions.packages[term];
                                const rate = adjustment ? Object.values(adjustment).length > 0 ? applyPriceAdjustment(updatedPrice, { amount: adjustment.value, type: adjustment.type }) : updatedPrice : updatedPrice;
                                return <tr key={term} className="border">
                                    <td>{term}</td>
                                    <td>{formatAmount(rate, {
                                        style: "currency",
                                        currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                                    })}</td>
                                    {materialRate &&
                                        <td>{materialRate?.type === "FREE" ? materialRate.value > 0 ? `${materialRate.value}x free` : formatAmount(printingCost, {
                                            style: "currency",
                                            currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                                        }) : formatAmount(printingCost, {
                                            style: "currency",
                                            currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                                        })}</td>
                                    }
                                    {installationRate &&
                                        <td>{installationRate ? installationRate.value > 0 && `${installationRate.value}x free` : ''}</td>
                                    }
                                </tr>
                            })}
                        </tbody>
                    </table>
                </DeckValue>
            </div>
        }
    </div >
}
const MapField = ({ site_code, longitude, latitude, ideal_view }: { site_code: string; longitude: string; latitude: string; ideal_view: string }) => {

    const { selectedOptions } = useDeck();
    const mapURL = createMapURL({ latitude, longitude });
    const { data } = useMap(site_code, mapURL)

    return data &&
        <>
            <img src={data} alt="map preview" data-rates={selectedOptions.settings.rate_basis === "MULTIPLE"} className={classNames("w-[clamp(60px,7vw,150px)] lg:w-[clamp(120px,6vw,150px)] data-[rates=true]:w-[clamp(60px,6vw,200px)] data-[rates=true]:lg:w-[clamp(90px,8vw,170px)] transition-all")} style={{
            }} loading="lazy" />
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <a data-rates={selectedOptions.settings.rate_basis === "MULTIPLE"} className={classNames("absolute bottom-0 left-0 bg-[#F2F2F2] w-[clamp(60px,6vw,150px)] lg:w-[clamp(120px,6vw,150px)] data-[rates=true]:w-[clamp(60px,6vw,200px)] data-[rates=true]:lg:w-[clamp(90px,8vw,170px)] text-center text-[clamp(4px,1vw,7px)] p-1")} style={{
                        // width: selectedOptions.rate_generator ? `${width - 35}px` : `${width}px`
                    }} href={ideal_view} target="_blank">View Google Map</a>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] text-[0.6rem] font-normal lowercase">
                    {ideal_view}
                </TooltipContent>
            </Tooltip>
        </>
}
const LandmarkField = ({ site }: { site: DeckSite }) => {
    const [landmarks, setLandmarks] = useState<Landmarks[]>([])

    useEffect(() => {
        const setup = async () => {
            setLandmarks(await getSiteLandmarks({ latitude: site.latitude, longitude: site.longitude }))
        }
        setup();
    }, [site.latitude, site.longitude])

    return <DeckValue className="text-[clamp(4px,1.2vw,8px)] font-normal w-full max-w-full truncate">
        {landmarks.map(lm => lm.display_name).slice(0, 5).join(" • ")}
    </DeckValue>
}

const AvailabilityField = ({ site }: { site: DeckSite }) => {
    const availability = useMemo(() => {
        if (!site.availability) return "OPEN";

        if (isBefore(new Date(site.availability), new Date())) return "OPEN";

        return format(new Date(site.availability), "PP")
    }, [site.availability])
    return <DeckValue className="text-red-300 whitespace-nowrap">
        {availability}
    </DeckValue>
};

const DeckLabel = ({ children, className }: { children: ReactNode; className?: string }) => {
    return <p className={cn("text-[clamp(4px,1vw,7px)] text-slate-500 uppercase", className)}>{children}:</p>
}

const DeckValue = ({ children, className }: { children: ReactNode; className?: string }) => {
    return <div className={cn("text-[clamp(5px,1.2vw,8px)] font-bold uppercase", className)}>{children}</div>;
}