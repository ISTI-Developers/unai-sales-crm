import Search from '@/components/search';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { columns, SiteAvailabilityWithStatus } from '@/data/sitePicker.columns';
import { useResponsiveTable } from '@/hooks/use-responsive-table';
import useAvailableSites from '@/hooks/useAvailableSites'
import { useImage, useThumbnail } from '@/hooks/useSites';
import { cn } from '@/lib/utils';
import { differenceInCalendarDays } from 'date-fns';
import { useInView } from 'framer-motion';
import {  CircleCheck, ImageOff, Loader2, MapPinIcon, PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { siteGlobalFilter } from '../pages/conforme/sites-picker.filter';
import { Badge } from '@/components/ui/badge';
import { getBookingContext, isQueueing } from '@/hooks/v2/useBookings';
import { Availability } from '@/interfaces/bookings.interface';

type SitesPickerProps = {
    value: Availability[];
    onValueChange: (value: Availability[]) => void;
    multiple?: boolean
}

const INITIAL_LIMIT = 30;

function SitesPicker({ value, onValueChange, multiple = false }: SitesPickerProps) {
    const sites = useAvailableSites();
    const [open, setOpen] = useState(false);
    const [selectedSites, setSelectedSites] = useState<SiteAvailabilityWithStatus[]>([])

    const filteredSites = useMemo(() => {
        const availableSites: SiteAvailabilityWithStatus[] = sites.map(site => {
            const { current, next } = getBookingContext(site.bookings);
            let remainingDays = 0;

            if (next) {
                if (next.booking_status === "RENEWAL") {
                    remainingDays = differenceInCalendarDays(new Date(next.date_to), new Date());
                }
            } else if (current) {
                remainingDays = differenceInCalendarDays(new Date(current.date_to), new Date())
            }

            if (current) {
                if (isQueueing(current)) {
                    const difference = differenceInCalendarDays(
                        new Date(),
                        current.date_from
                    );
                    return {
                        ...site,
                        availability: difference < -30 ? "QUEUEING" : "BOOKED"
                    }
                }
            }
            return {
                ...site,
                availability: remainingDays <= 60 ? "AVAILABLE" : `BOOKED UNTIL ${current?.date_to}`
            }

        });

        // selected sites
        const selectedCodes = new Set(
            value.map(site => site.site_code)
        );

        const sortSelectedFirst = (sites: SiteAvailabilityWithStatus[]) => {
            return [...sites].sort((a, b) => {
                const aSelected = selectedCodes.has(a.site_code);
                const bSelected = selectedCodes.has(b.site_code);

                return Number(bSelected) - Number(aSelected);
            });
        };

        return sortSelectedFirst(availableSites)
    }, [sites, value]);

    const { table, setGlobalFilter, globalFilter } = useResponsiveTable<SiteAvailabilityWithStatus, unknown>({ data: filteredSites, columns, size: INITIAL_LIMIT, globalFilterFn: siteGlobalFilter })

    const onSelectSites = () => {
        onValueChange(selectedSites);
        setOpen(false);
    };

    useEffect(() => {
        setSelectedSites(filteredSites.filter(item => value.some(cItem => cItem.site_code === item.site_code)));
    }, [value, filteredSites])

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-auto min-h-9 w-full justify-start whitespace-normal py-2"
                >
                    {value.length === 0 ? (
                        <>
                            <PlusIcon className="mr-2 size-4 shrink-0" />
                            Add Site
                        </>
                    ) : (
                        <div className="flex w-full items-start gap-3 text-left">
                            <div className="mt-1 shrink-0">
                                <MapPinIcon className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                                {multiple && (
                                    <p className="font-semibold">
                                        {value.length} sites selected
                                    </p>
                                )}

                                {value.slice(0, multiple ? 3 : 1).map((site) => (
                                    <div key={site.site_code} className="space-y-0.5">
                                        <p className="font-semibold">
                                            {site.site_code}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {site.address}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {site.board_facing}
                                        </p>
                                    </div>
                                ))}

                                {multiple && value.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                        +{value.length - 3} more sites
                                    </p>
                                )}

                                <p className="pt-1 text-xs text-primary w-fit ml-auto">
                                    Change selection
                                </p>
                            </div>
                        </div>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-[80vw] flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Sites Selection</DialogTitle>
                    <DialogDescription>
                        Select the sites you wish to add to your conforme.
                    </DialogDescription>
                </DialogHeader>

                <header className='flex gap-4'>
                    <Search setValue={setGlobalFilter} />
                    {(table.getRowModel().rows.length > 0 && globalFilter.length > 2) && (
                        <Button
                            type="button"
                            className="h-7"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const filteredSites = table
                                    .getRowModel()
                                    .rows
                                    .map(row => row.original);

                                setSelectedSites(prev => {
                                    const allSelected = filteredSites.every(site =>
                                        prev.some(selected => selected.ID === site.ID)
                                    );

                                    if (allSelected) {
                                        // Deselect all filtered sites
                                        return prev.filter(
                                            selected =>
                                                !filteredSites.some(site => site.ID === selected.ID)
                                        );
                                    }

                                    // Select all filtered sites
                                    const newSites = filteredSites.filter(
                                        site => !prev.some(selected => selected.ID === site.ID)
                                    );

                                    return [...prev, ...newSites];
                                });
                            }}
                        >
                            {selectedSites.length > 0 &&
                                table.getRowModel().rows.every(row =>
                                    selectedSites.some(site => site.ID === row.original.ID)
                                )
                                ? "Deselect"
                                : "Select"}{" "}
                            {table.getRowModel().rows.length} sites
                        </Button>
                    )}
                </header>

                <ScrollArea className="h-[400px] min-h-0 w-full">
                    <main className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 p-1">
                        {table.getRowModel().rows.map((row) => (
                            <SiteCard
                                key={row.id}
                                site={row.original}
                                selectedSites={selectedSites}
                                setSite={setSelectedSites}
                                multiple={multiple}
                            />
                        ))}
                    </main>
                </ScrollArea>

                <footer className="ml-auto">
                    <Button
                        type="button"
                        disabled={selectedSites.length === 0}
                        onClick={onSelectSites}
                        variant="outline"
                        className="bg-main-100 text-white"
                    >
                        {value.length > 0 ? "Update" : "Add"} ({selectedSites.length}) sites
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    )
}

function SiteCard({
    site,
    selectedSites,
    setSite,
    multiple,
}: {
    site: SiteAvailabilityWithStatus;
    selectedSites: SiteAvailabilityWithStatus[];
    setSite: Dispatch<SetStateAction<SiteAvailabilityWithStatus[]>>;
    multiple: boolean;
}) {
    const imageRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(imageRef, {
        once: true,
        margin: "200px",
    });
    const { data, isLoading } = useImage(site.site_code, undefined, isInView);
    const { data: thumbnail, isLoading: isThumbnailLoading } = useThumbnail(data?.selectedImage?.upload_id)
    const [imageLoaded, setImageLoaded] = useState(false);

    const imageUrl = data?.selectedImage?.url;

    const isSelected = selectedSites.some(
        item => item.site_code === site.site_code
    );

    const handleSelect = () => {
        setSite(prev => {
            const alreadySelected = prev.some(
                item => item.site_code === site.site_code
            );

            if (multiple) {
                // Multiple selection: toggle this site.
                return alreadySelected
                    ? prev.filter(
                        item => item.site_code !== site.site_code
                    )
                    : [...prev, site];
            }

            // Single selection: select only this site.
            // Clicking it again clears the selection.
            return alreadySelected ? [] : [site];
        });
    };

    // Reset when the image URL changes
    useEffect(() => {
        setImageLoaded(false);
    }, [imageUrl]);

    const isImageLoading = (isThumbnailLoading || isLoading) && !imageLoaded;

    return (
        <div
            role={multiple ? "checkbox" : "radio"}
            aria-checked={isSelected}
            tabIndex={0}
            onClick={handleSelect}
            onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect();
                }
            }}
            className="relative rounded-lg border overflow-hidden w-full cursor-pointer"
        >
            <div className="relative aspect-video bg-muted">
                {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                )}
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={site.site_code}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                        className={cn(
                            "w-full h-full object-cover transition-opacity duration-200",
                            !isImageLoading ? "opacity-100" : "opacity-0"
                        )}
                    />
                ) : !isImageLoading && <div className='flex items-center justify-center w-full h-full object-cover transition-opacity duration-200'>
                    <ImageOff size={40} />
                </div>}
            </div>
            {/* Selected overlay */}
            {isSelected && (
                <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center pointer-events-none z-[2]">
                    <CircleCheck
                        size={100}
                        className="text-emerald-400"
                    />
                </div>
            )}
            <Badge className={cn('absolute top-2 right-2 text-[0.7rem] leading-tight',
                site.availability.includes("AVAILABLE") ? "bg-emerald-200 text-emerald-700 hover:bg-emerald-200" : "bg-red-200 text-red-700 hover:bg-red-200"
            )}>{site.availability}</Badge>

            <div className="absolute bottom-0 bg-gradient-to-t from-[#000000ee] from-25% to-transparent w-full text-white text-xs leading-tight p-3">
                <h3 className='text-sm font-semibold'>{site.site_code} <span>({site.size})</span></h3>
                <p className="text-[0.65rem] font-light">{site.address}</p>
                <p className="text-[0.55rem] italic font-light">{site.board_facing}</p>
            </div>
        </div>
    );
}

export default SitesPicker