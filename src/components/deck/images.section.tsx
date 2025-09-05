import { SiteImage } from "@/interfaces/sites.interface";
import { Container } from "./container.deck";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useMemo } from "react";
import { useDeck } from "@/providers/deck.provider";
import { CircleCheck } from "lucide-react";

const ImagesSection = ({
  site_code,
  data,
}: {
  site_code: string;
  data?: SiteImage[];
}) => {
  const { selectedOptions, setSelectedOptions } = useDeck();
  useEffect(() => {
    if (!data || data.length === 0) return;

    const targetSite = selectedOptions.find(
      (site) => site.site_code === site_code
    );

    if (!targetSite) return;

    if (!targetSite.images) {
      setSelectedOptions((prev) =>
        prev.map((site) =>
          site.site_code === site_code
            ? {
                ...site,
                images: data[0],
              }
            : site
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedOptions, site_code]);

  return (
    <Container>
      <ScrollArea className="max-h-[30vh] overflow-y-auto">
        <div className="flex flex-wrap flex-1 gap-4 w-full justify-center items-center text-black">
          {(data?.length ?? 0) > 0
            ? data?.map((item) => {
                return (
                  <ImageItem
                    site_code={site_code}
                    key={item.upload_id}
                    item={item}
                  />
                );
              })
            : "No sites found from UNIS"}
        </div>
      </ScrollArea>
    </Container>
  );
};

const ImageItem = ({
  site_code,
  item,
}: {
  site_code: string;
  item: SiteImage;
}) => {
  const { selectedOptions, setSelectedOptions } = useDeck();

  const onImageSelected = () => {
    setSelectedOptions((prev) =>
      prev.map((site) =>
        site.site_code === site_code
          ? {
              ...site,
              images: item, // Append new image
            }
          : site
      )
    );
  };

  const isSelected = useMemo(() => {
    const site = selectedOptions.find((site) => site.site_code === site_code);

    if (site) {
      if (site.images) {
        return site.images.upload_id === item.upload_id;
      }
      return false;
    }

    return false;
  }, [item.upload_id, selectedOptions, site_code]);

  return (
    <div className="relative rounded-lg overflow-hidden">
      <img
        src={item.url}
        role="button"
        className="w-full max-w-[200px] 2xl:max-w-[250px] aspect-video object-cover"
        loading="lazy"
        alt={`image_${item.upload_id}`}
        onClick={onImageSelected}
      />
      {/* Overlay for selected images */}
      {isSelected && (
        <div
          id={`selected-${site_code}`}
          role="button"
          title="check"
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center"
          onClick={onImageSelected}
        >
          <CircleCheck className="text-white" size={50} />
        </div>
      )}
    </div>
  );
};
export default ImagesSection;
