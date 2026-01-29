import { DeckSite } from "@/interfaces/deck.interface";
import { cn } from "@/lib/utils";
import SiteImages from "./sites.images";
import { Landmarks, SiteImage } from "@/interfaces/sites.interface";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getSiteLandmarks, useSiteImages } from "@/hooks/useSites";
import { fetchImage } from "@/lib/fetch";
import { format, isBefore, subDays } from "date-fns";
import { applyPriceAdjustment, formatAmount } from "@/lib/format";
import { getRecord, saveRecord } from "@/providers/api";
import { useDeck } from "@/providers/deck.provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useGeneratePowerpoint } from "@/hooks/usePrint";
import classNames from "classnames";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

export const SiteItem = ({ item, width, className }: { item: DeckSite; width: number; className?: string }) => {
    const { setSelectedSites } = useDeck()
    const imageResult = useSiteImages(item.site_code);
    const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
    const [loading, setLoading] = useState(false);

    const availability = useMemo(() => {
        if (!item.availability) return "AVAILABLE";

        if (!item.is_prime) {
            const rofrDate = subDays(new Date(item.availability), 60);
            if (isBefore(rofrDate, new Date())) {
                return 'AVAILABLE'
            }
            return format(rofrDate, "PP");
        }

        const rofrDate = subDays(new Date(item.availability), 30);
        if (isBefore(rofrDate, new Date())) {
            return 'AVAILABLE'
        }
        return format(rofrDate, "PP");
    }, [item.availability, item.is_prime])

    useEffect(() => {
        let isCancelled = false;
        const objectUrls: string[] = []; // Track all created object URLs

        const setup = async () => {
            console.log(imageResult.error);
            if (!imageResult.data) return;

            const processedImagePromises = imageResult.data.map(async (image) => {
                setLoading(true)
                const imgUrl = await fetchImage(image.upload_path); // returns object URL
                if (imgUrl) {
                    objectUrls.push(imgUrl); // Track it for cleanup
                }
                return {
                    ...image,
                    url: imgUrl ?? "",
                };
            });

            const processedImages = await Promise.all(processedImagePromises);
            if (!isCancelled) {
                setSiteImages(processedImages);
                setLoading(false);
            }
        };

        setup();

        return () => {
            isCancelled = true;
            objectUrls.forEach((url) => URL.revokeObjectURL(url)); // Clean up blob URLs
        };
    }, [imageResult.data]);

    const imageWidth = useMemo(() => {
        if (width > 600) {
            return 200;
        }

        return 125;
    }, [width])
    return (
        <div
            id={item.site_code}
            className={cn(
                "group w-full bg-white bg-contain bg-no-repeat rounded overflow-hidden relative flex-shrink-0",

                className
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="relative w-full h-[5vh] bg-main-500 flex items-center justify-between px-4">
                <img src="/unai-w.png" alt="" className="h-full p-2 px-0" />
                <p className="text-white font-semibold text-sm">
                    {`Billboard Site in ${item.city}`}
                </p>
                <Button onClick={() => {
                    setSelectedSites(prev => {
                        return prev.filter(p => p.ID !== item.ID)
                    })
                }} className="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-all" variant="destructive" size={"icon"}>
                    <Trash2 />
                </Button>
            </div>
            <div className="grid grid-cols-[1.75fr_1fr] h-full">
                <SiteImages site_code={item.site_code} images={siteImages} isLoading={loading} isFetching={imageResult.isFetching} />
                {/* BASIC INFO */}
                <div className="py-4 grid grid-cols-2 h-fit gap-y-2 gap-x-4 pr-3">
                    <div className="flex gap-1">
                        <DeckLabel>
                            Availability
                        </DeckLabel>
                        <AvailabilityField site={item} />
                    </div>
                    <div className="flex gap-1">
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
                        <DeckValue className="text-[8px]">{item.address}</DeckValue>
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
                        <DeckValue>{item.traffic_count}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Population
                        </DeckLabel>
                        <DeckValue>{item.vicinity_population}</DeckValue>
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
                            <MapField site_code={item.site_code} latitude={item.latitude} longitude={item.longitude} ideal_view={item.ideal_view} width={imageWidth} />
                        </DeckValue>
                    </div>
                </div>

            </div>
        </div>
    );
};

const PriceField = ({ site }: { site: DeckSite }) => {
    const { selectedOptions } = useDeck();
    const { applyOptions } = useGeneratePowerpoint();
    const updatedPrice = applyOptions(site, site.price, Number(site.price));

    const inclusions = selectedOptions.display_options;

    const hasInclusions = useMemo(() => {
        if (!inclusions?.material_inclusions && !inclusions?.installation_inclusions) return false;

        if (typeof inclusions.material_inclusions === "number" && typeof inclusions.installation_inclusions === "number") {
            return inclusions.material_inclusions > 0 || inclusions.installation_inclusions > 0;
        } else if (Array.isArray(inclusions.material_inclusions) && Array.isArray(inclusions.installation_inclusions)) {
            return inclusions.material_inclusions.some(rate => rate.count !== 0) || inclusions.installation_inclusions.some(rate => rate.count !== 0)
        }
        return false;
    }, [inclusions])

    return <div className="leading-none flex flex-col gap-1 col-[1/3]">
        {selectedOptions.rate_generator ?
            <DeckValue className="text-[8px] font-normal">
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="p-1 border">Months</th>
                            <th>Monthly Rate</th>
                            {hasInclusions && <>
                                <th>Material</th>
                                <th>Installation</th>
                            </>}
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {selectedOptions.rate_generator.map((month, index) => {
                            const { discount, type, duration } = month;
                            const monthlyRate = discount === 0 ? updatedPrice : applyPriceAdjustment(updatedPrice, { amount: discount, type: type })
                            return <tr key={duration} className="border">
                                <td className="p-0.5 border">{duration}</td>
                                <td>{formatAmount(monthlyRate, {
                                    style: "currency",
                                    currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                                })}</td>
                                {inclusions && hasInclusions && <>
                                    {Array.isArray(inclusions.material_inclusions!) && <td className="lowercase">{inclusions.material_inclusions[index].count}x</td>}
                                    {Array.isArray(inclusions.installation_inclusions!) && <td className="lowercase">{inclusions.installation_inclusions[index].count}x</td>}
                                </>}
                            </tr>
                        })}
                    </tbody>
                </table>
            </DeckValue>
            : <>
                <DeckLabel className="text-[#000] font-bold">
                    Monthly Rate
                </DeckLabel>
                <DeckValue className="text-[11px]">
                    <p>{`${formatAmount(updatedPrice, {
                        style: "currency",
                        currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                    })} + VAT`}</p>
                    {inclusions && hasInclusions && <p className="font-normal capitalize space-x-1 text-[10px] leading-normal">
                        <span>FREE</span>
                        {!!inclusions.installation_inclusions && <span>{inclusions.installation_inclusions}x installation &</span>}
                        {!!inclusions.material_inclusions && <span>{inclusions.material_inclusions}x material</span>}
                    </p>}
                </DeckValue>
            </>}
    </div>
}
const MapField = ({ site_code, longitude, latitude, ideal_view, width }: { site_code: string; longitude: string; latitude: string; ideal_view: string, width: number }) => {

    const url = import.meta.env.VITE_BASE_MAP_URL;

    const { setSelectedSites, selectedOptions } = useDeck();

    const [zoom] = useState(16);
    const [center] = useState<google.maps.LatLngLiteral>({
        lat: Number(latitude),
        lng: Number(longitude)
    })

    const mapURL = useMemo(() => {
        if (!center) return;

        const params = new URLSearchParams({
            center: `${center.lat},${center.lng} `,
            zoom: String(zoom),
            size: "350x350",
            key: import.meta.env.VITE_GCP_API,
        });

        params.append(
            "markers",
            `icon: https://salespf.unmg.com.ph/billboard_64.png|${center.lat},${center.lng}`
        );

        return `${url}?${params.toString()}`;
    }, [center, zoom, url])

    useEffect(() => {
        if (!site_code || !mapURL) return;

        const controller = new AbortController();
        const { signal } = controller;

        const setup = async () => {
            try {
                // 🧠 Try getting cached version first
                const cached = await getRecord<string>("maps", site_code);
                const isFresh = cached && (Date.now() - cached.lastFetched) / 1000 < 86400;

                let map: string;

                if (isFresh) {
                    map = cached.data;
                } else {
                    const res = await fetch(mapURL, { signal });
                    if (!res.ok) throw new Error(`Failed to fetch map: ${res.status}`);

                    const blob = await res.blob();

                    // Convert blob → base64 Data URL
                    map = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    await saveRecord("maps", site_code, map);
                }

                // 🧩 Skip updating state if request was aborted mid-process
                if (signal.aborted) return;

                setSelectedSites(prev => {
                    if (!prev) return prev;
                    return prev.map(item =>
                        item.site_code === site_code
                            ? { ...item, map }
                            : item
                    );
                });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    if (err.name === "AbortError") {
                        console.log("Map fetch aborted for", site_code);
                    } else {
                        console.error("Failed to fetch/convert map:", err);
                    }
                }
            }
        };

        setup();

        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [site_code, mapURL]);


    return mapURL &&
        <>
            <img src={mapURL} alt="map preview" className={classNames("w-full transition-all")} style={{
                width: selectedOptions.rate_generator ? `${width - 35}px` : `${width}px`
            }} loading="lazy" />
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <a className={classNames("absolute bottom-0 left-0 bg-[#F2F2F2] w-full text-center text-[0.5rem] p-1")} style={{
                        width: selectedOptions.rate_generator ? `${width - 35}px` : `${width}px`
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

    return <DeckValue className="text-[7px] font-normal w-full">
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
    return <p className={cn("text-[7px] text-slate-500 uppercase", className)}>{children}:</p>
}

const DeckValue = ({ children, className }: { children: ReactNode; className?: string }) => {
    return <div className={cn("text-[8px] font-bold uppercase", className)}>{children}</div>;
}