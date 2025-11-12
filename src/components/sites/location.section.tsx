import { SiteDetailswithMapping } from "@/interfaces/sites.interface";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Container } from "../container";
import Field from "../field";
import { useState } from "react";
const LocationSection = ({ data }: { data: SiteDetailswithMapping | null }) => {
  const fields = ["address", "city", "region", "ideal_view"];
  const [zoom, setZoom] = useState(16);

  const Details = () => {
    return (
      data && (
        <div className="absolute z-[2] grid gap-2 text-[0.65rem] bg-white bg-opacity-50 border border-white rounded-br-lg w-1/3 h-fit leading-none p-4 backdrop-blur-sm">
          {fields.map((field) => (
            <Field
              key={field}
              id={field}
              label={field === "city" ? "area" : field}
              labelClasses="text-xs leading-none"
              value={
                field === "ideal_view" ? (
                  <>
                    <a
                      href={data[field] as string}
                      target="_blank"
                      className="w-fit"
                    >
                      view
                    </a>
                  </>
                ) : (
                  (data[field] as string)
                )
              }
            />
          ))}
        </div>
      )
    );
  };
  return (
    <Container title="Location Information" className="bg-white">
      {data ? (
        <APIProvider apiKey={import.meta.env.VITE_GCP_API}>
          <div className="relative h-[32.5vh] rounded-md w-full">
            <Details />
            <Map
              zoom={zoom}
              center={{
                lat: !isNaN(Number(data.latitude)) ? Number(data.latitude) : 0,
                lng: !isNaN(Number(data.longitude)) ? Number(data.longitude) : 0,
              }}
              mapTypeControl={false}
              mapId="bbe301bc60bb084c"
              controlled
              onZoomChanged={(event) => setZoom(event.detail.zoom)}
            // onBoundsChanged={onMapGenerate}
            >
              <Marker
                position={{
                  lat: !isNaN(Number(data.latitude)) ? Number(data.latitude) : 0,
                  lng: !isNaN(Number(data.longitude)) ? Number(data.longitude) : 0,
                }}
              />
            </Map>
          </div>
        </APIProvider>
      ) : (
        <>Loading...</>
      )}
    </Container>
  );
};

export default LocationSection;
