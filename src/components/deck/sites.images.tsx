import { useDeck } from "@/providers/deck.provider";
import { useEffect } from "react";
import { ImageOff, LoaderIcon } from "lucide-react";
import { useImage } from "@/hooks/useSites";

const SiteImages = ({ site_code, selectedImage }: { site_code: string; selectedImage?: number }) => {
    const { setSelectedSites, setOption } = useDeck();
    const { data: images, isLoading } = useImage(site_code, selectedImage);

    useEffect(() => {
        if (!images?.selectedImage) return;

        console.log(images.selectedImage)

        setSelectedSites(prev => {
            let changed = false;

            const next = prev.map(site => {
                if (site.site_code !== site_code) return site;

                if (site.image === images.selectedImage.upload_id) return site;

                changed = true;

                return {
                    ...site,
                    image: images.selectedImage.upload_id,
                    ...images.selectedImage,
                };
            });

            return changed ? next : prev;
        });
    }, [images?.selectedImage, site_code, setSelectedSites]);

    return (
        <div className="flex justify-center items-center px-4 w-full min-w-0 pb-4">
            {images?.selectedImage ?
                <div role="button" onClick={() => setOption("images")} className="overflow-hidden rounded-sm group border">
                    <img
                        src={images.selectedImage.url ?? undefined}
                        className="w-full object-cover"
                        loading="lazy"
                        alt={`image_${images.selectedImage.upload_id}`}
                    />
                </div>
                : isLoading ? <div className="w-full aspect-video bg-zinc-50 flex flex-col items-center justify-center text-zinc-500 font-semibold gap-2">
                    <LoaderIcon className="animate-spin" />
                    <p>Loading image preview</p>
                </div> :
                    <div className="w-full aspect-video bg-zinc-50 flex flex-col items-center justify-center text-zinc-500 font-semibold gap-2">
                        <ImageOff />
                        <p>No image available</p>
                    </div>}
        </div>
    )
}

export default SiteImages