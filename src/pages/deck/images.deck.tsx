import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useImage } from '@/hooks/useSites';
import { SiteImage } from '@/interfaces/sites.interface';
import { fetchImage } from '@/lib/fetch';
import { useDeck } from '@/providers/deck.provider'
import { CircleCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react'

function DeckImageOptions() {
  const { selectedSite: siteIndex, selectedSites, setSelectedSites } = useDeck();
  const selectedSite = useMemo(() => selectedSites[siteIndex], [selectedSites, siteIndex])
  const { data: images, isLoading } = useImage(selectedSite.site_code);

  const onImageSelected = (item: SiteImage) => {
    localStorage.setItem(`${selectedSite.site_code}_selected`, `${item.upload_id}`)

    setSelectedSites((prev) =>
      prev.map((site) =>
        site.site_code === selectedSite.site_code
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
  if (!images || isLoading) return <>Loading...</>
  return (
    <div className="p-2 pl-0 flex flex-col gap-2">
      <h1 className="font-bold uppercase text-[0.6rem]">Select Image for {selectedSite.site_code}</h1>
      <ScrollArea className='h-[86vh] rounded-lg'>
        <div className='flex flex-col gap-4 overflow-y-auto'>
          {images.images.map(image => {
            return <ImageItem site_code={selectedSite.site_code} image={image} selectedImage={selectedSite.image} onImageSelected={onImageSelected} />
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

const ImageItem = ({ image, selectedImage, onImageSelected, site_code }: { image: SiteImage; selectedImage?: number; onImageSelected: (image: SiteImage) => void; site_code: string }) => {
  const [siteImage, setSiteImage] = useState<SiteImage>()

  useEffect(() => {
    const setup = async () => {
      const imageData = await fetchImage(image.upload_path);
      setSiteImage({ ...image, ...imageData })
    }
    setup();
  }, [image])

  if (!siteImage) return <Skeleton className='w-full h-full aspect-video' />

  return <div className='relative aspect-video overflow-hidden'>
    <img
      src={siteImage.url ?? undefined}
      role="button"
      className="w-full max-w-full h-full object-cover rounded-md"
      loading="lazy"
      alt={`image_${siteImage.upload_id}`}
      onClick={() => onImageSelected(siteImage)}
    />
    {/* Overlay for selected images */}
    {selectedImage === siteImage.upload_id && (
      <div
        id={`selected-${site_code}`}
        role="button"
        title="check"
        className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center rounded-md"
        onClick={() => onImageSelected(siteImage)}
      >
        <CircleCheck className="text-white" size={50} />
      </div>
    )}
  </div>
}

export default DeckImageOptions