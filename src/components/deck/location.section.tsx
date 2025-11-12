import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import { Container } from "./container.deck";
import Field from "../field";
import { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { DeckSite, useDeck } from "@/providers/deck.provider";
import { useSitelandmarks } from "@/hooks/useSites";
import { cn, Coordinate, haversineDistance } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Landmarks } from "@/interfaces/sites.interface";
import { Check, CircleCheck, Pen } from "lucide-react";
import { motion } from "framer-motion";
import { getRecord, saveRecord } from "@/providers/api";
import { Button } from "../ui/button";
const LocationSection = ({ data }: { data: DeckSite | null }) => {

  const url = import.meta.env.VITE_BASE_MAP_URL;

  const { options, selectedOptions: configs, setMaps } = useDeck();

  const [zoom, setZoom] = useState(16);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>()

  const [isEditing, setEdit] = useState(false);

  const mapURL = useMemo(() => {
    if (!data || !center) return;

    const params = new URLSearchParams({
      center: `${center.lat},${center.lng}`,
      zoom: String(zoom),
      size: "350x350",
      key: import.meta.env.VITE_GCP_API,
    });

    if (options.landmark_visibility?.show) {
      const siteConfig = configs.find(
        (config) => config.site_code === data.site_code
      );
      if (siteConfig?.landmarks?.length) {
        siteConfig.landmarks.forEach((landmark, index) => {
          const { latitude, longitude } = landmark;
          params.append(
            "markers",
            `color:blue|label:${index + 1}|${latitude},${longitude}`
          );
        });
      }
    }

    params.append(
      "markers",
      `icon:https://salespf.unmg.com.ph/billboard_64.png|${center.lat},${center.lng}`
    );

    return `${url}?${params.toString()}`;
  }, [data, center, zoom, options.landmark_visibility?.show, url, configs])



  useEffect(() => {
    if (!data || !mapURL) return;

    const controller = new AbortController();
    const { signal } = controller;

    const setup = async () => {
      try {
        // 🧠 Try getting cached version first
        const cached = await getRecord<string>("maps", data.site_code);
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

          await saveRecord("maps", data.site_code, map);
        }

        // 🧩 Skip updating state if request was aborted mid-process
        if (signal.aborted) return;

        setMaps((prev) => {
          const newMap = { site_code: data.site_code, map };
          const exists = prev.some((m) => m.site_code === data.site_code);

          return exists
            ? prev.map((m) => (m.site_code === data.site_code ? newMap : m))
            : [...prev, newMap];
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            console.log("Map fetch aborted for", data.site_code);
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
  }, [data, mapURL]);


  useEffect(() => {
    if (!data) return;

    setCenter({
      lat: Number(data.latitude),
      lng: Number(data.longitude)
    })
  }, [data])

  return (
    <Container className="bg-white">
      {data ? (
        // <APIProvider apiKey={import.meta.env.VITE_GCP_API}>
        <div className="grid xl:grid-cols-[repeat(2,auto)] gap-6 justify-between relative">
          <Details data={data} />
          {isEditing ?
            <div className="w-full">
              <APIProvider apiKey={import.meta.env.VITE_GCP_API}>
                <div className="relative h-[200px] xl:h-[300px] rounded-xl overflow-hidden w-[300px]">
                  <Map
                    zoom={zoom}
                    center={center}
                    mapTypeControl={false}
                    mapId="bbe301bc60bb084c"
                    fullscreenControl={false}
                    onZoomChanged={(event) => setZoom(event.detail.zoom)}
                    onBoundsChanged={(event) => setCenter(event.detail.center)}
                  >
                    <AdvancedMarker
                      position={center}
                    >
                      <img
                        src="/billboard_64.png"
                        className={cn("z-[10] transition-all duration-150 ")}
                        title={data.site_code}
                      />
                    </AdvancedMarker>
                  </Map>
                </div>
              </APIProvider>
            </div> :
            mapURL &&
            <img src={mapURL} alt="map preview" className="max-w-[200px] xl:max-w-[300px] rounded-xl" loading="lazy" />}
          <div className="absolute bottom-0 right-0 p-2">
            {isEditing &&
              <Button className="rounded-full bg-emerald-100 hover:bg-emerald-100 hover:text-emerald-600 text-emerald-600 border-emerald-600 border-2" size="icon" variant="outline" onClick={() => setEdit(false)}><Check /></Button>
            }
            {!isEditing &&
              <Button className="rounded-full bg-yellow-100 hover:bg-yellow-100 hover:text-yellow-600 text-yellow-600 border-yellow-600 border-2" size="icon" variant="outline" onClick={() => setEdit(true)}><Pen /></Button>
            }
            {/* <Button>Save</Button> */}
          </div>
        </div>
        // </APIProvider>
      ) : (
        <>Loading...</>
      )}
    </Container>
  );
};

const Details = ({ data }: { data: DeckSite }) => {
  const fields = ["region", "city", "address", "ideal_view"];
  return (
    data && (
      <div>
        <div className="grid gap-2 text-[0.65rem] h-fit uppercase leading-none w-full pb-2">
          {fields.map((field) => (
            <Field
              key={field}
              id={field}
              label={field === "city" ? "area" : field}
              labelClasses="text-xs leading-none"
              value={field === "ideal_view" ? <a href={data[field]} className="break-words text-[0.6rem] underline text-main-100 lowercase max-w-[300px]" target="_blank">{data[field]}</a> : data[field] as string}
            />
          ))}
        </div>
        <hr />
        <NearbyLandmarks
          site_code={data.site_code}
          coordinates={{
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
          }}
        />
      </div>
    )
  );
};

const NearbyLandmarks = ({
  site_code,
  coordinates,
}: {
  site_code: string;
  coordinates: Coordinate;
}) => {
  const { data } = useSitelandmarks();
  const { selectedOptions, setSelectedOptions } = useDeck();

  const landmarks = useMemo(() => {
    if (!data) return [];
    return data.filter((landmark) => {
      const { latitude, longitude } = landmark;
      const landmarkCoordinates = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      };
      const distance = haversineDistance(coordinates, landmarkCoordinates);

      return distance <= 100;
    });
  }, [coordinates, data]);

  const onLandmarkSelection = (landmark: Landmarks) => {
    setSelectedOptions((prev) =>
      prev.map((site) => {
        if (site.site_code !== site_code) return site;

        const isSelected = site.landmarks.some((l) => l.ID === landmark.ID);
        const updatedLandmarks = isSelected
          ? site.landmarks.filter((l) => l.ID !== landmark.ID)
          : [...site.landmarks, landmark];

        return {
          ...site,
          landmarks: updatedLandmarks,
        };
      })
    );
  };

  const checkedLandmarks: Landmarks[] = useMemo(() => {
    if (selectedOptions.length === 0) return [];

    const site = selectedOptions.find((site) => site.site_code === site_code);

    if (site) {
      return site.landmarks;
    }
    return [];
  }, [selectedOptions, site_code]);

  useEffect(() => {
    if (landmarks.length === 0) return;

    setSelectedOptions((prev) =>
      prev.map((site) => {
        if (site.site_code !== site_code) return site;

        const currentLandmarks = site.landmarks.map((l) => l.ID).sort().join(",");
        const newLandmarks = landmarks
          .slice(0, 5)
          .map((l) => l.ID)
          .sort()
          .join(",");

        // only update if different
        if (currentLandmarks === newLandmarks) return site;

        return {
          ...site,
          landmarks: landmarks.slice(0, 5),
        };
      })
    );
    console.count('rendering')
  }, [site_code]);


  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold">Nearby Landmarks</Label>
      <div className="flex gap-2 flex-wrap flex-1 items-center">
        {landmarks.length > 0
          ? landmarks.map((landmark) => {
            return (
              <motion.div
                whileTap={{ scale: 0.9 }} // this is the "pop" effect
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                key={landmark.ID}
              >
                <Badge
                  onClick={() => onLandmarkSelection(landmark)}
                  role="button"
                  variant="outline"
                  className={cn(
                    "bg-sky-100 text-sky-700 border-sky-300 flex gap-1 rounded-full p-1 py-0.5",
                    checkedLandmarks.includes(landmark)
                      ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                      : ""
                  )}
                >
                  {checkedLandmarks.includes(landmark) && (
                    <CircleCheck size={14} />
                  )}
                  <p>{landmark.display_name}</p>
                </Badge>
              </motion.div>
            );
          })
          : "No landmarks found."}
      </div>
    </div>
  );
};

export default LocationSection;
