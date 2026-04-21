import { SiteImage } from '@/interfaces/sites.interface';
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button } from '../ui/button';
import { CircleCheck } from 'lucide-react';
import { fetchImage } from '@/lib/fetch';
import { useDeck } from '@/providers/deck.provider';

function SiteImageSelector({ site_code, images, selectedImage, setSelectedImage, setShow }: { site_code: string; images?: SiteImage[]; selectedImage: SiteImage; setSelectedImage: Dispatch<SetStateAction<SiteImage | undefined>>; setShow: (show: boolean) => void }) {
    const { setSelectedSites } = useDeck();
    const onImageSelected = (item: SiteImage) => {
        setSelectedImage(item);
        localStorage.setItem(`${site_code}_selected`, `${item.upload_id}`)
        setSelectedSites((prev) =>
            prev.map((site) =>
                site.site_code === site_code
                    ? {
                        ...site,
                        image: item.upload_id, // Append new image
                        url: item.url,
                        width: item.width,
                        height: item.height,
                    }
                    : site
            )
        );
    };
    const [siteImages, setSiteImages] = useState<SiteImage[] | undefined>()
    useEffect(() => {
        let isCancelled = false;
        const objectUrls: string[] = []; // Track all created object URLs

        const setup = async () => {
            if (!images) return;

            const processedImagePromises = images.map(async (image) => {
                const imageData = await fetchImage(image.upload_path); // returns object URL
                if (imageData) {

                    objectUrls.push(imageData.url); // Track it for cleanup
                }

                return {
                    ...image,
                    url: imageData?.url ?? "",
                    width: imageData?.width || 0,
                    height: imageData?.height || 0
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
    }, [images]);

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-white z-[2] overflow-y-auto">
            <header className="p-4 font-semibold flex items-center gap-4 sticky top-0 bg-white z-[2]">
                <Button type='button' onClick={() => setShow(false)} size="sm" variant="outline">Back</Button>
                <p>Change Image</p>
            </header>
            <main className='grid grid-cols-3 gap-2 p-2 px-4 overflow-y-auto'>
                {siteImages ? siteImages.map((img,) => {
                    return <div className='relative aspect-video overflow-hidden'>
                        <img
                            src={img.url ?? undefined}
                            role="button"
                            className="w-full max-w-full h-full object-cover rounded-md"
                            loading="lazy"
                            alt={`image_${img.upload_id}`}
                            onClick={() => onImageSelected(img)}
                        />
                        {/* Overlay for selected images */}
                        {selectedImage.upload_id === img.upload_id && (
                            <div
                                id={`selected-${site_code}`}
                                role="button"
                                title="check"
                                className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center rounded-md"
                                onClick={() => onImageSelected(img)}
                            >
                                <CircleCheck className="text-white" size={50} />
                            </div>
                        )}
                    </div>
                }) : images?.map(() => <div className='w-full animate-pulse h-[120px] bg-zinc-200 flex items-center justify-center rounded-md' />
                )}
            </main>
        </div>
    )
}

export default SiteImageSelector