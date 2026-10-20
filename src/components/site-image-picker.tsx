import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircleCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useImage } from '@/hooks/useSites';
import { SiteImage } from '@/interfaces/sites.interface';
import { fetchImage } from '@/lib/fetch';
import { cn } from '@/lib/utils';

interface SiteImagePickerProps {
    value?: string;
    onValueChange: (value?: string) => void;
    site_code: string;
}

function SiteImagePicker({ site_code, value, onValueChange }: SiteImagePickerProps) {
    const { data, isLoading, isError, refetch } = useImage(site_code);
    const [open, setOpen] = useState(false);

    const selectImage = (url: string, id: number) => {
        localStorage.setItem(`${site_code}_selected`, `${id}`)
        onValueChange(url);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button type="button" aria-label={`Choose image for ${site_code}`} className="w-[150px] overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {value ? (
                        <img src={value} alt={`Selected image for ${site_code}`} className="aspect-video w-full object-cover object-top" />
                    ) : (
                        <span className="flex aspect-video items-center justify-center text-sm text-muted-foreground">Choose image</span>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Choose Site Image</DialogTitle>
                    <DialogDescription>{site_code}</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1">
                    {isLoading ? (
                        <p role="status" className="py-6 text-center text-sm text-muted-foreground">Loading images...</p>
                    ) : isError ? (
                        <div role="alert" className="space-y-3 py-6 text-center">
                            <p className="text-sm text-muted-foreground">Unable to load images.</p>
                            <Button type="button" variant="outline" onClick={() => void refetch()}>Try again</Button>
                        </div>
                    ) : !data?.images.length ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No images available for this site.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {data.images.map(image => (
                                <ImageOption key={image.upload_id} image={image} value={value} onSelect={selectImage} />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ImageOption({ image, value, onSelect }: { image: SiteImage; value?: string; onSelect: (url: string, id: number) => void }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['site-image-picker', image.upload_path],
        queryFn: async () => {
            const result = await fetchImage(image.upload_path);
            if (!result?.url) throw new Error('Unable to load image');
            return result;
        },
        staleTime: Infinity,
        retry: 1,
    });

    if (isLoading) return <Skeleton className="aspect-video w-full" />;
    if (isError || !data) return <p className="flex aspect-video items-center justify-center rounded-md border text-sm text-muted-foreground">Image unavailable</p>;

    const selected = value === data.url;
    return (
        <button
            type="button"
            aria-label={`Select image ${image.upload_id}`}
            aria-pressed={selected}
            onClick={() => onSelect(data.url, image.upload_id)}
            className={cn('relative aspect-video overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected && 'ring-2 ring-ring')}
        >
            <img src={data.url} alt={`Site image ${image.upload_id}`} loading="lazy" className="h-full w-full object-cover object-top" />
            {selected && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <CircleCheck className="text-white" size={36} />
                </span>
            )}
        </button>
    );
}

export default SiteImagePicker;
