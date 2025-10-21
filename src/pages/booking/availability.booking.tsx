import { DataTable } from '@/data/data-table';
import { columns } from "@/data/booking.columns";
import { useBookings } from "@/hooks/useBookings";
import { useAvailableSites, useSites } from '@/hooks/useSites';
import { BookingTable } from '@/interfaces/sites.interface';
import { useMemo } from 'react';
import { useAccess } from '@/hooks/useClients';
const SiteAvailability = () => {
    const { data: sites } = useSites();
    const { data: bookings } = useBookings();
    const { data, isLoading } = useAvailableSites();
    const { access: edit } = useAccess("booking.update");
    const availableSites: BookingTable[] = useMemo(() => {
        if (!sites || !data || !bookings || isLoading) return [];

        const availableSites = new Set(data.map(d => d.site));
        // const storedSites = new Set(sites.map(s => s.site_code));
        const inStoredButNotInAvailable = sites.filter(site => !availableSites.has(site.site_code));
        // const inAvailableButNotInStored = data.filter(site => !storedSites.has(site.site));

        const mappedStoredSites = inStoredButNotInAvailable.map(item => {
            const booking = bookings.filter(booking => booking.site_code === item.site_code);
            return {
                structure: item.structure_code,
                site: item.site_code,
                address: item.address,
                site_rental: 0,
                facing: item.board_facing,
                bookings: booking,
                remarks: item.remarks ?? undefined,
            };
        })

        const mappedAvailableSites = data.map(item => {
            const booking = bookings.filter(booking => booking.site_code === item.site);
            const site = sites.find((siteItem) => siteItem.site_code === item.site);

            return {
                ...item,
                site_rental: item.site_rental ?? 0,
                facing: site?.board_facing ?? "",
                bookings: booking,
                remarks: site?.remarks ?? undefined,
                days_vacant: booking.filter((book) => book.booking_status !== "CANCELLED").length >
                    0
                    ? undefined
                    : item.days_vacant,
            }
        })

        return [...mappedAvailableSites, ...mappedStoredSites]
    }, [sites, data, bookings, isLoading]);
    return (
        <DataTable columns={columns.filter(column => {
            if (!edit) return column.id !== "action";
            return column;
        })} data={availableSites} size={100} />
    )
}

export default SiteAvailability