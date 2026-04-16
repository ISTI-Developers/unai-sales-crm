import { SiteImage } from "@/interfaces/sites.interface";
import { useDeck } from "@/providers/deck.provider";
import { Dispatch, lazy, SetStateAction, Suspense, useEffect, useRef, useState } from "react";
import { ImageOff, LoaderIcon } from "lucide-react";
import { useSiteImages } from "@/hooks/useSites";
import { fetchImage } from "@/lib/fetch";
import { Button } from "../ui/button";

const SiteImageSelector = lazy(() => import("./site.image.selector"))

const SiteImages = ({ site_code }: { site_code: string; }) => {
    const { data: images, isLoading } = useSiteImages(site_code)
    const { setSelectedSites } = useDeck();
    const [selectedImage, setImage] = useState<SiteImage | undefined>()

    const initializedRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        if (initializedRef.current[site_code]) return;
        if (!images || images.length === 0) return;

        let isActive = true;

        const cached = localStorage.getItem(`${site_code}_selected`);
        const imageMap = new Map(images.map(img => [img.upload_id, img]));

        let image = images[0];

        if (cached) {
            const stored = imageMap.get(Number(cached));
            if (stored) image = stored;
        }

        const setup = async () => {
            if (!image) return;

            const imageData = await fetchImage(image.upload_path);
            if (!isActive || !imageData) return;

            setImage({ ...image, ...imageData });
            setSelectedSites(prev =>
                prev.map(site =>
                    site.site_code === site_code
                        ? { ...site, image: image.upload_id, ...imageData }
                        : site
                )
            );

            initializedRef.current[site_code] = true;
        };

        setup();

        return () => {
            isActive = false;
        };
    }, [images, site_code, setSelectedSites]);

    return (
        <div className="flex justify-center items-center -mt-4 px-4 w-full min-w-0">
            {selectedImage ?
                <ImageItem site_code={site_code} item={selectedImage} images={images} setSelectedImage={setImage} />
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
const ImageItem = ({
    site_code,
    item,
    images,
    setSelectedImage
}: {
    site_code: string;
    item: SiteImage;
    images?: SiteImage[];
    setSelectedImage: Dispatch<SetStateAction<SiteImage | undefined>>;
}) => {
    const [show, setShow] = useState(false)

    return (
        <div>
            <div className="relative overflow-hidden rounded-md group">
                <img
                    src={item.url ?? undefined}
                    className="w-full max-w-full"
                    loading="lazy"
                    alt={`image_${item.upload_id}`}
                />
                <Button onClick={() => setShow(true)} className="bg-white absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all" variant="outline" size="sm">Change</Button>
            </div>
            {show &&
                <Suspense fallback={<>Loading</>}>
                    <SiteImageSelector site_code={site_code} images={images} selectedImage={item} setSelectedImage={setSelectedImage} setShow={setShow} />
                </Suspense>
            }
        </div>
    );
};

export default SiteImages