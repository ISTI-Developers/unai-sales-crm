import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Container } from "./container.deck";
import Field from "../field";
import { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { DeckSite, useDeck } from "@/providers/deck.provider";
import { useSitelandmarks } from "@/hooks/useSites";
import { cn, Coordinate, haversineDistance } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Landmarks } from "@/interfaces/sites.interface";
import { CircleCheck } from "lucide-react";
import { motion } from "framer-motion";
const LocationSection = ({ data }: { data: DeckSite | null }) => {
  const [zoom, setZoom] = useState(16);
  const { options, selectedOptions: configs, setMaps } = useDeck();

  useEffect(() => {
    if (!data) return;

    let isCancelled = false;

    const setup = async () => {
      const baseURL = "https://maps.googleapis.com/maps/api/staticmap";
      const params = new URLSearchParams({
        center: `${data.latitude},${data.longitude}`,
        zoom: String(zoom),
        size: "300x300",
        key: import.meta.env.VITE_GCP_API,
      });

      // Add marker for site
      params.append(
        "markers",
        `color:red|icon:https://ooh.scmiph.com/assets/classic-sm.png|${data.latitude},${data.longitude}`
      );

      // If landmarks are enabled
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

      const mapURL = `${baseURL}?${params.toString()}`;

      try {
        // fetch as blob
        const res = await fetch(mapURL);
        const blob = await res.blob();

        // convert blob to base64 data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        if (!isCancelled) {
          setMaps((prev) => {
            const newMap = {
              site_code: data.site_code,
              map: dataUrl, // ✅ correct data:image/png;base64,... format
            };

            const exists = prev.some((m) => m.site_code === data.site_code);
            return exists
              ? prev.map((m) => (m.site_code === data.site_code ? newMap : m))
              : [...prev, newMap];
          });
        }
      } catch (err) {
        console.error("Failed to fetch/convert map:", err);
      }
    };

    setup();

    return () => {
      isCancelled = true;
    };
  }, [configs, data, options.landmark_visibility?.show, zoom]);



  return (
    <Container className="bg-white">
      {data ? (
        <APIProvider apiKey={import.meta.env.VITE_GCP_API}>
          <div className="grid grid-cols-2 gap-6 justify-between">
            <Details data={data} />
            <div className="relative h-[250px] rounded-md overflow-hidden w-full">
              <Map
                zoom={zoom}
                center={{
                  lat: Number(data.latitude),
                  lng: Number(data.longitude),
                }}
                mapTypeControl={false}
                mapId="bbe301bc60bb084c"
                fullscreenControl={false}
                controlled
                onZoomChanged={(event) => setZoom(event.detail.zoom)}
              // onBoundsChanged={onMapGenerate}
              >
                <Marker
                  position={{
                    lat: Number(data.latitude),
                    lng: Number(data.longitude),
                  }}
                />
              </Map>
            </div>
          </div>
        </APIProvider>
      ) : (
        <>Loading...</>
      )}
    </Container>
  );
};

const Details = ({ data }: { data: DeckSite }) => {
  const fields = ["region", "city", "address"];
  return (
    data && (
      <div>
        <div className="grid gap-2 text-[0.65rem] h-fit leading-none w-full pb-2">
          {fields.map((field) => (
            <Field
              key={field}
              id={field}
              label={field === "city" ? "area" : field}
              labelClasses="text-xs leading-none"
              value={data[field] as string}
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

        const isSelected = site.landmarks.some((l) => l.l_id === landmark.l_id);
        const updatedLandmarks = isSelected
          ? site.landmarks.filter((l) => l.l_id !== landmark.l_id)
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
        return {
          ...site,
          landmarks: [...landmarks.slice(0, 5)],
        };
      })
    );
  }, []);

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
                key={landmark.l_id}
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
