import { DeckSite, useDeck } from "@/providers/deck.provider";
import BasicSection from "./basic.section";
import LocationSection from "./location.section";
import { useSiteImages } from "@/hooks/useSites";
import ImagesSection from "./images.section";
import { useEffect, useState } from "react";
import { fetchImage } from "@/lib/fetch";
import { SiteImage } from "@/interfaces/sites.interface";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useActiveUNISURL } from "@/hooks/useSettings";

const SiteItem = ({ site }: { site: DeckSite }) => {
  const { data: images } = useSiteImages(site.site_code);
  const { data: unisURL, isLoading } = useActiveUNISURL();
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const { setSelectedOptions, setSelectedSites } = useDeck();

  const onDelete = () => {
    setSelectedOptions((prev) => {
      return prev.filter((item) => item.site_code !== site.site_code);
    });
    setSelectedSites((prev) => {
      return prev.filter((item) => item.site_code !== site.site_code);
    });
  };
  useEffect(() => {
    if (!unisURL) return;
    let isCancelled = false;
    const objectUrls: string[] = []; // Track all created object URLs

    const setup = async () => {
      if (!images) return;

      const processedImagePromises = images.map(async (image) => {
        const upload_path =
          unisURL.path + image.upload_path;
        const imgUrl = await fetchImage(upload_path); // returns object URL
        if (imgUrl) {
          objectUrls.push(imgUrl); // Track it for cleanup
        }
        return {
          ...image,
          upload_path,
          url: imgUrl ?? "",
        };
      });

      const processedImages = await Promise.all(processedImagePromises);
      if (!isCancelled) {
        setSiteImages(processedImages);
      }
    };

    setup();

    return () => {
      isCancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url)); // Clean up blob URLs
    };
  }, [images, unisURL, isLoading]);
  return (
    <div
      className="bg-slate-100 rounded-xl flex flex-col gap-4"
      key={site.site_code}
      id={site.site_code}
    >
      <header className="bg-slate-100 p-4 pb-0 z-[2] rounded-t-xl font-bold flex items-center justify-between sticky top-0">
        <p>{site.site_code}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-red-300 hover:text-white hover:bg-red-300"
        >
          <Trash2 />
        </Button>
      </header>
      <div className="p-4 flex flex-col gap-4 pt-0">
        <BasicSection data={site} />
        <LocationSection data={site} />
        <ImagesSection site_code={site.site_code} data={siteImages} />
      </div>
    </div>
  );
};

export default SiteItem;
