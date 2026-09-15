import Search from '@/components/search';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { columns } from '@/data/sitePicker.columns';
import { useResponsiveTable } from '@/hooks/use-responsive-table';
import useAvailableSites from '@/hooks/useAvailableSites'
import { useImage, useThumbnail } from '@/hooks/useSites';
import { Cart, SiteRow } from '@/interfaces/requests.interface';
import { SiteAvailability } from '@/interfaces/sites.interface';
import { getLatestBooking } from '@/lib/fetch';
import { cn, getCost, getSiteInstallationCost } from '@/lib/utils';
import { addDays, differenceInCalendarDays, isBefore } from 'date-fns';
import { useInView } from 'framer-motion';
import { CircleCheck, ImageOff, Loader2, PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { siteGlobalFilter } from './sites-picker.filter';

interface SitesPickerProps {
    cartSites: SiteRow[];
    setCart: Dispatch<SetStateAction<Cart>>;
}

const INITIAL_LIMIT = 25;

function SitesPicker({ cartSites, setCart }: SitesPickerProps) {
    const sites = useAvailableSites();
    const [open, setOpen] = useState(false);
    const [selectedSites, setSelectedSites] = useState<SiteAvailability[]>([])

    const filteredSites = useMemo(() => {
        const availableSites = sites.filter(site => {
            const remainingDays = site.remaining_days ?? 0;
            const siteBookings = site.bookings.map(sb => ({
                ...sb,
                is_prime: site.is_prime,
            }));

            const latestBooking = getLatestBooking(siteBookings);
            if (latestBooking?.booking_status === "QUEUEING") {
                const difference = differenceInCalendarDays(
                    new Date(),
                    latestBooking.date_from
                );
                return difference < -30;
            }
            return remainingDays <= 60;
        });
        const selectedCodes = new Set(
            cartSites.map(site => site.site.site_code)
        );

        const sortSelectedFirst = (sites: SiteAvailability[]) => {
            return [...sites].sort((a, b) => {
                const aSelected = selectedCodes.has(a.site_code);
                const bSelected = selectedCodes.has(b.site_code);

                return Number(bSelected) - Number(aSelected);
            });
        };

        return sortSelectedFirst(availableSites)
    }, [sites, cartSites]);
    const { table, setGlobalFilter, globalFilter } = useResponsiveTable({ data: filteredSites, columns, size: INITIAL_LIMIT, globalFilterFn: siteGlobalFilter })

    const onSelectSites = () => {
        const sites = selectedSites.map(site => {
            const existing = cartSites.find(
                item => item.site.site_code === site.site_code
            );

            if (existing) {
                return existing;
            }

            const endDate = site.end_date
                ? !isBefore(new Date(site.end_date), new Date())
                    ? new Date(site.end_date)
                    : new Date()
                : new Date();

            return {
                site,
                srp: site.price,
                package_rate: "0",
                offered_rate: "0",
                installation: {
                    free: 0,
                    paid: 0,
                    cost: getSiteInstallationCost(site.size, site.region)
                },
                material: {
                    free: 0,
                    paid: 0,
                    cost: getCost(site.site_code)
                },
                date: {
                    from: endDate,
                    to: addDays(endDate, 30),
                },
            };
        });

        setCart(prev => ({
            ...prev,
            sites,
        }));

        setOpen(false);
    };

    useEffect(() => {
        setSelectedSites(filteredSites.filter(item => cartSites.some(cItem => cItem.site.site_code === item.site_code)));
    }, [cartSites, filteredSites])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className='w-fit h-7 pl-3'>
                    <PlusIcon />
                    <p>Add Site</p>
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
                        {cartSites.length > 0 ? "Update" : "Add"} ({selectedSites.length}) sites
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    )
}

function SiteCard({
    site,
    selectedSites,
    setSite
}: {
    site: SiteAvailability;
    selectedSites: SiteAvailability[];
    setSite: Dispatch<SetStateAction<SiteAvailability[]>>;
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

    // Reset when the image URL changes
    useEffect(() => {
        setImageLoaded(false);
    }, [imageUrl]);

    const isImageLoading = (isThumbnailLoading || isLoading) && !imageLoaded;

    return (
        <div
            ref={imageRef}
            role="button"
            onClick={() => {
                setSite(prev => {
                    if (prev.some(p => p.site_code === site.site_code)) {
                        return prev.filter(p => p.site_code !== site.site_code);
                    }

                    return [...prev, site];
                });
            }}
            className="relative rounded-lg border overflow-hidden w-full"
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
            {selectedSites.some(
                item => item.site_code === site.site_code
            ) && (
                    <div className="absolute top-0 left-0 w-full h-full bg-emerald-900/20 flex items-center justify-center pointer-events-none z-[2]">
                        <CircleCheck
                            size={100}
                            className="text-emerald-400"
                        />
                    </div>
                )}

            <div className="absolute bottom-0 bg-gradient-to-t from-[#000000ee] from-25% to-transparent w-full text-white text-xs leading-tight p-3">
                <h3 className='text-sm font-semibold'>{site.site_code} <span>({site.size})</span></h3>
                <p className="text-[0.65rem] font-light">{site.address}</p>
                <p className="text-[0.55rem] italic font-light">{site.board_facing}</p>
            </div>
        </div>
    );
}

export default SitesPicker