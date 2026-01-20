import { SiteImage } from "@/interfaces/sites.interface";
import { useDeck } from "@/providers/deck.provider";
import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { CircleCheck } from "lucide-react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
const SiteImages = ({
    site_code,
    images,
    isFetching,
    isLoading,
}: {
    site_code: string;
    images?: SiteImage[];
    isLoading: boolean;
    isFetching: boolean;
}) => {

    const { selectedSites, setSelectedSites } = useDeck();
    const [api, setApi] = useState<CarouselApi>();

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        if (!images || images.length === 0) return;

        initializedRef.current = true;

        const cached = localStorage.getItem(`${site_code}_selected`);

        if (cached) {
            const storedID = Number(cached);
            const selectedImage = images.find(img => img.upload_id === storedID);

            setSelectedSites(prev =>
                prev.map(site =>
                    site.site_code === site_code
                        ? { ...site, image: selectedImage?.upload_id, url: selectedImage?.url }
                        : site
                )
            );
        } else {
            const first = images[0];
            setSelectedSites(prev =>
                prev.map(site =>
                    site.site_code === site_code
                        ? { ...site, image: first.upload_id, url: first.url }
                        : site
                )
            );
        }
    }, [images, site_code]);


    useEffect(() => {
        const targetSite = selectedSites.find(
            (site) => site.site_code === site_code
        );
        if (targetSite?.image) {
            localStorage.setItem(
                `${site_code}_selected`,
                String(targetSite.image)
            );
        }
    }, [selectedSites, site_code]);

    const sortedImages = useMemo(() => {
        if (!images || images.length === 0) return [];

        const site = selectedSites.find(s => s.site_code === site_code);
        if (!site?.image) return images; // no selection yet → keep original order

        const selectedIndex = images.findIndex(img => img.upload_id === site.image);
        if (selectedIndex === -1 || selectedIndex === 0) return images;

        const selected = images[selectedIndex];
        const others = [
            ...images.slice(0, selectedIndex),
            ...images.slice(selectedIndex + 1),
        ];

        return [selected, ...others];
    }, [images, selectedSites, site_code]);
    return (
        <div className="flex justify-center items-center -mt-4 px-4 w-full min-w-0">
            <Carousel setApi={setApi} className="overflow-hidden">
                <CarouselContent>
                    {(isFetching || isLoading) ?
                        <Skeleton className="w-full aspect-[1.926/1]" /> :
                        images && sortedImages.length > 0
                            ? sortedImages.map((item) => (
                                <CarouselItem key={item.upload_id} className="w-full min-w-0">
                                    <ImageItem item={item} site_code={site_code} api={api} />
                                </CarouselItem>
                            ))
                            : <div className="p-4 w-full bg-zinc-100 h-full">
                                <p className="ml-4">No images found.</p>
                            </div>}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}
const ImageItem = ({
    site_code,
    item,
    api
}: {
    site_code: string;
    item: SiteImage;
    api: CarouselApi
}) => {
    const { selectedSites, setSelectedSites } = useDeck();

    const onImageSelected = () => {
        if (!api) return;

        api?.scrollTo(0);
        setSelectedSites((prev) =>
            prev.map((site) =>
                site.site_code === site_code
                    ? {
                        ...site,
                        image: item.upload_id, // Append new image
                        url: item.url,
                    }
                    : site
            )
        );
    };

    const isSelected = useMemo(() => {
        const site = selectedSites.find((site) => site.site_code === site_code);

        if (site) {
            if (site.image) {
                return site.image === item.upload_id;
            }
            return false;
        }

        return false;
    }, [item.upload_id, selectedSites, site_code]);

    return (
        <div className="relative overflow-hidden aspect-[1.926/1]">
            <img
                src={item.url ?? undefined}
                role="button"
                className="w-full max-w-full"
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

export default SiteImages