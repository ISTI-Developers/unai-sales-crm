import {
    AdvancedMarker,
    APIProvider,
    Map,
    MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState, memo } from "react";
import Search from "../search";
import { useSitelandmarks, useSites } from "@/hooks/useSites";
import { cn } from "@/lib/utils";
import { Site } from "@/interfaces/sites.interface";
import { MapPinIcon } from "lucide-react";
import { flushSync } from "react-dom";

// ✅ Memoized marker sub-component
const SiteMarkers = memo(({ sites, zoom, activeSite, map, setSite }: any) => {
    const handleMarkerClick = useCallback(
        (site: Site) => {
            if (!map) return;
            map.panTo({ lat: Number(site.latitude), lng: Number(site.longitude) }); // no React re-render
            map.setZoom(17);
            setSite(site);
        },
        [map, setSite]
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
                        zIndex={100}
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

const LandmarkMarkers = memo(({ landmarks }: any) => (
    <>
        {landmarks.map((landmark: any) => {
            const position = {
                lat: Number(landmark.latitude),
                lng: Number(landmark.longitude),
            };
            return (
                <AdvancedMarker
                    key={`landmark_marker_${landmark.l_id}`}
                    position={position}
                >
                    <MapPinIcon fill="#172554" stroke="#1e40af" />
                </AdvancedMarker>
            );
        })}
    </>
));
LandmarkMarkers.displayName = "LandmarkMarkers";

// ✅ Main component
const Maps = () => {
    const { data: sites } = useSites();
    const { data: landmarks } = useSitelandmarks();

    const [site, setSite] = useState<Site>();
    const [search, setSearch] = useState("");
    const [zoom, setZoom] = useState(6.2);
    const [center, setCenter] = useState({ lat: 12.8797, lng: 121.774 });
    const [map, setMap] = useState<google.maps.Map>();
    const [visibleLandmarks, setVisibleLandmarks] = useState<any[]>([]);

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
            map.setZoom(17);
        },
        [map]
    );

    return (
        <div className="flex flex-col gap-4 pt-2 w-full">
            <div className="grid grid-cols-[1fr_3fr] gap-2">
                {/* Left List */}
                <section key="site-list" className="w-full flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Search setValue={setSearch} />
                        <div>Landmarks</div>
                    </div>

                    <div className="h-[80vh] overflow-y-auto grid gap-2">
                        {sites ? (
                            sites.map((site) => (
                                <div
                                    role="button"
                                    onClick={() => handleSiteSelect(site)}
                                    key={site.site_code}
                                    className="grid grid-cols-[2fr_1fr] p-2 hover:bg-slate-50 min-h-[70px] leading-tight cursor-pointer"
                                >
                                    <p className="font-bold text-sm">{site.site_code}</p>
                                    <p className="text-[0.5rem] row-[2/3]">{site.address}</p>
                                    <p className="text-[0.65rem] text-end">{site.board_facing}</p>
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
                            <LandmarkMarkers landmarks={visibleLandmarks} />
                            <SiteMarkers
                                sites={sites}
                                zoom={zoom}
                                activeSite={site}
                                map={map}
                                setSite={setSite}
                            />
                        </Map>
                    </APIProvider>

                    {/* Overlay */}
                    {site && (
                        <>
                            <div
                                role="button"
                                onClick={() => setSite(undefined)}
                                className="bg-black/40 w-full absolute top-0 left-0 h-full opacity-100 transition-all pointer-events-auto"
                            />
                            <div className="absolute top-0 right-0 h-full bg-white w-[300px] transition-transform translate-x-0 shadow-lg">
                                <div className="p-4 text-sm">
                                    <h2 className="font-bold text-base mb-2">
                                        {site.site_code}
                                    </h2>
                                    <p>{site.address}</p>
                                    <p className="text-xs text-gray-500">{site.board_facing}</p>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Maps;
