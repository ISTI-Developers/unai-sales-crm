import {
    AdvancedMarker,
    APIProvider,
    Map,
    MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState, memo, Dispatch, SetStateAction, useMemo } from "react";
import Search from "../search";
import { useSiteImages, useSitelandmarks, useSites } from "@/hooks/useSites";
import { cn, haversineDistance } from "@/lib/utils";
import { Landmarks, Site } from "@/interfaces/sites.interface";
import { MapPinIcon } from "lucide-react";
import { flushSync } from "react-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Link } from "react-router-dom";
import LandmarkFilter from "./landmark.filters";
import { List } from "@/interfaces";

interface SiteMarkers {
    sites?: Site[];
    zoom: number;
    activeSite?: Site;
    map?: google.maps.Map
    setSite: Dispatch<SetStateAction<Site | undefined>>
}
// ✅ Memoized marker sub-component
const SiteMarkers = memo(({ sites, zoom, activeSite, map, setSite }: SiteMarkers) => {
    const handleMarkerClick = useCallback(
        (site: Site) => {
            if (!map) return;
            map.panTo({ lat: Number(site.latitude), lng: Number(site.longitude) }); // no React re-render
            map.setZoom(zoom > 17 ? zoom : 17);
            setSite(site);
        },
        [map, setSite, zoom]
    );

    return (
        <>
            {sites?.map((item: Site) => {
                const position = {
                    lat: Number(item.latitude),
                    lng: Number(item.longitude),
                };
                const sizeClass =
                    item.ID === activeSite?.ID
                        ? "w-[8em]"
                        : zoom > 10
                            ? "w-[4em]"
                            : "w-[2em]";

                return (
                    <AdvancedMarker
                        key={`marker_${item.site_code}`}
                        position={position}
                        onClick={() => handleMarkerClick(item)}
                        zIndex={activeSite?.ID === item.ID ? 100 : 50}
                    >
                        <img
                            src="/billboard.png"
                            className={cn("z-[10] transition-all duration-150", sizeClass)}
                            title={item.site_code}
                        />
                    </AdvancedMarker>
                );
            })}
        </>
    );
});
SiteMarkers.displayName = "SiteMarkers";

const LandmarkMarkers = memo(({ landmarks, zoom }: { landmarks: Landmarks[]; zoom: number }) => (
    landmarks.map((landmark: Landmarks, index) => {
        const position = {
            lat: Number(landmark.latitude),
            lng: Number(landmark.longitude),
        };
        return landmarks && (
            <AdvancedMarker
                key={`landmark_marker_${index}`}
                position={position}
                className="flex flex-col items-center gap-2"
            >
                {zoom >= 18 &&
                    <p className="bg-white/50 backdrop-blur-[2px] shadow shadow-white border-t border-t-white p-1.5 rounded">{landmark.display_name}</p>
                }
                <MapPinIcon fill="#172554" stroke="#1e40af" />
            </AdvancedMarker>
        );
    })
));
LandmarkMarkers.displayName = "LandmarkMarkers";

const Maps = () => {
    const { data: sites } = useSites();
    const { data: landmarks } = useSitelandmarks();

    const [site, setSite] = useState<Site>();
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<List[]>([])
    const [zoom, setZoom] = useState(6.2);
    const [center, setCenter] = useState({ lat: 12.8797, lng: 121.774 });
    const [map, setMap] = useState<google.maps.Map>();
    const [visibleLandmarks, setVisibleLandmarks] = useState<Landmarks[]>([]);

    // ✅ Update map reference and center only once
    const onBoundsChanged = useCallback((e: MapCameraChangedEvent) => {
        setMap((prev) => prev || e.map);
        setCenter(e.detail.center);
    }, []);

    // ✅ Debounced landmark filtering
    useEffect(() => {
        if (!landmarks || zoom < 17 || !map) return;

        const timeout = setTimeout(() => {
            const bounds = map.getBounds();
            if (!bounds) return;

            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            setVisibleLandmarks(
                landmarks.filter(
                    (marker) =>
                        Number(marker.latitude) <= ne.lat() &&
                        Number(marker.latitude) >= sw.lat() &&
                        Number(marker.longitude) <= ne.lng() &&
                        Number(marker.longitude) >= sw.lng()
                )
            );
        }, 150);

        return () => clearTimeout(timeout);
    }, [landmarks, zoom, map]);

    // ✅ When clicking a site from sidebar list
    const handleSiteSelect = useCallback(
        (site: Site) => {
            if (!map) return;
            flushSync(() => setSite(site));
            map.panTo({ lat: Number(site.latitude), lng: Number(site.longitude) });
            map.setZoom(zoom > 17 ? zoom : 19);
        },
        [map, zoom]
    );

    const filteredSites = useMemo(() => {
        if (!sites) return sites;

        return sites.filter(site => {
            const searchLower = search.toLowerCase();
            return (
                site.site_code.toLowerCase().includes(searchLower) ||
                site.address.toLowerCase().includes(searchLower) ||
                site.board_facing?.toLowerCase().includes(searchLower)
            );
        });
    }, [sites, search])

    const filteredSitesByLandmark = useMemo(() => {
        if (filters.length === 0 || !filteredSites || !landmarks) return filteredSites;

        return filteredSites.filter(site => {
            const landmarkFilters = filters.map((item) => item.value);
            const selectedOptions = landmarks.filter((landmark) =>
                landmark.types.some((type) => landmarkFilters.includes(type))
            );
            const { latitude, longitude } = site;

            return selectedOptions.some((landmark) => {
                const { latitude: lat, longitude: lng } = landmark;
                const distance = haversineDistance(
                    { lat: parseFloat(latitude), lng: parseFloat(longitude) },
                    { lat: parseFloat(lat), lng: parseFloat(lng) }
                );
                return distance <= 100;
            });
        })
    }, [filters, landmarks, filteredSites])

    return (
        <div className="flex flex-col gap-4 pt-2 w-full">
            <div className="grid grid-cols-[1fr_3fr] gap-2">
                {/* Left List */}
                <section key="site-list" className="w-full flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <Search setValue={setSearch} className="h-9" />
                        <LandmarkFilter value={filters} setValue={setFilters} />
                    </div>

                    <div className="h-[80vh] overflow-y-auto flex flex-col gap-2">
                        {filteredSitesByLandmark ? (
                            filteredSitesByLandmark.map((item) => (
                                <div
                                    role="button"
                                    onClick={() => handleSiteSelect(item)}
                                    key={item.site_code}
                                    className={cn("basis-[75px] grid grid-cols-[2fr_1fr] p-2 hover:bg-slate-50 h-[75px] leading-tight cursor-pointer rounded-md", item === site ? "bg-slate-200" : "")}
                                >
                                    <p className="font-bold text-sm">{item.site_code}</p>
                                    <p className="text-[0.5rem] row-[2/3]">{item.address}</p>
                                    <p className="text-[0.65rem] text-end">{item.board_facing}</p>
                                </div>
                            ))
                        ) : (
                            <>Loading...</>
                        )}
                    </div>
                </section>

                {/* Right Map */}
                <section className="w-full relative border overflow-hidden">
                    <APIProvider apiKey={import.meta.env.VITE_GCP_KEY}>
                        <Map
                            className="h-[calc(100vh-9rem)]"
                            center={center}
                            mapId="daf109cb7449fd0d"
                            zoom={zoom}
                            onZoomChanged={(e) => setZoom(e.detail.zoom)}
                            onBoundsChanged={onBoundsChanged}
                            gestureHandling="greedy"
                            disableDefaultUI
                        >
                            {zoom >= 17 &&
                                <LandmarkMarkers zoom={zoom} landmarks={visibleLandmarks} />
                            }
                            <SiteMarkers
                                sites={filteredSitesByLandmark}
                                zoom={zoom}
                                activeSite={site}
                                map={map}
                                setSite={setSite}
                            />
                        </Map>
                    </APIProvider>
                    <>
                        <div
                            title="button"
                            role="button"
                            onClick={() => setSite(undefined)}
                            className={cn("bg-black/40 w-full absolute top-0 left-0 h-full transition-all", site ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}
                        />
                        <div className={cn("absolute top-0 right-0 h-full bg-white w-[300px] transition-transform", site ? "translate-x-0 shadow-lg" : "translate-x-full shadow-lg")}>
                            {site &&
                                <SitePreview {...site} />
                            }
                        </div>
                    </>
                </section>
            </div>
        </div>
    );
};

function SitePreview(site: Site) {
    const { data, isLoading } = useSitelandmarks();
    const { data: images } = useSiteImages(site.site_code)

    const landmarks = useMemo(() => {
        if (!data) return data;

        return data.filter(landmark => {
            const { latitude, longitude } = landmark;
            const landmarkCoordinates = {
                lat: Number(latitude),
                lng: Number(longitude),
            };

            const distance = haversineDistance({ lat: Number(site.latitude), lng: Number(site.longitude) }, landmarkCoordinates)

            return distance <= 500;
        })

    }, [data, site])


    return <div className="p-4 text-sm flex flex-col gap-4">
        <h2 className="font-bold flex gap-1 items-center">
            <img src="/billboard.png" alt="billboard icon" className="w-9" />
            {site.site_code}
        </h2>
        <div className="overflow-y-auto scrollbar-none rounded">
            {images && images.length > 0 ? <>
                <Carousel className="group w-full max-w-sm rounded">
                    <CarouselContent>
                        {images.map(image => <CarouselItem key={image.upload_id}>
                            <img src={import.meta.env.VITE_UNIS_URL + image.upload_path} alt="" className="rounded" loading="lazy" />
                        </CarouselItem>)}
                    </CarouselContent>
                    <CarouselNext className="transition-all opacity-50 group-hover:opacity-100" />
                    <CarouselPrevious className="transition-all opacity-50 group-hover:opacity-100" />
                </Carousel>
            </> : <p className="bg-slate-200 rounded-md p-4 text-center text-xs font-semibold text-slate-400">Site images not found</p>}
        </div>
        <div className="p-2 bg-slate-100 rounded-md">
            <p className="text-xs font-semibold">{site.address}</p>
            <p className="text-xs text-gray-500 italic">{site.board_facing}</p>
        </div>
        <div className="p-2 bg-slate-100 rounded-md">
            <p>Landmarks</p>
            {isLoading ? <>Loading landmarks</> : landmarks && landmarks.length > 0 ? <ul className="max-h-[200px] overflow-y-auto scrollbar-none">
                {landmarks.map(landmark => {
                    return <li key={landmark.l_id} className="text-[0.65rem] list-disc ml-3">
                        {landmark.display_name}
                    </li>
                })}
            </ul> : <p className="bg-slate-200 rounded-md p-4 text-center text-xs font-semibold text-slate-400">Landmarks not found</p>}
        </div>
        <Link to={`/sites/${site.site_code}`} className="underline">View full information &gt;</Link>
    </div>
}

export default Maps;
