import { DataTable } from '@/data/data-table';
import { columns } from "@/data/bookings.columns";
import { useBookings } from "@/hooks/useBookings";
import { useOverridenSiteEndDates, useSiteRentals, useSites } from '@/hooks/useSites';
import { SiteAvailability as SiteAvailabilityType } from '@/interfaces/sites.interface';
import { useMemo } from 'react';
import { useAccess } from '@/hooks/useClients';
import { getEndDate, getLatestBooking } from '@/lib/fetch';
import { differenceInDays } from 'date-fns';
import { splitClientName } from '@/lib/format';
const SiteAvailability = () => {
    const { data: sites } = useSites();
    const { data: bookings, isLoading } = useBookings();
    const { data: adjustments } = useOverridenSiteEndDates();
    const { data: rentals } = useSiteRentals();
    const { access: edit } = useAccess("booking.update");
    console.log(rentals);

    const availableSites: SiteAvailabilityType[] = useMemo(() => {
        if (!sites || !bookings || !adjustments || isLoading || !rentals) return [];

        const activeSites = sites.filter(site => site.status === 1);

        const contracts = activeSites.map(site => {
            const siteBookings = bookings.filter(booking => booking.site_code === site.site_code);
            const adjustment = adjustments.find(adjustment => adjustment.site_code === site.site_code);
            const updatedBookings = siteBookings.map(sb => ({ ...sb, is_prime: site.is_prime }))

            const booking = getLatestBooking(updatedBookings);
            const endDate = getEndDate(booking, adjustment);
            const siteRental = rentals.find(rent => rent.site_code === site.site_code);
            const { client, product } = splitClientName(booking ? booking.client : "");
            return {
                ...site,
                site_rental: siteRental ? siteRental.site_rental : booking ? booking.site_rental : 0,
                client: client,
                product: product,
                date_from: booking?.date_from,
                end_date: endDate,
                remaining_days: endDate ? Math.max(differenceInDays(new Date(endDate), new Date()), 0) : booking ? Math.max(differenceInDays(new Date(booking.date_to), new Date()), 0) : 0,
                days_vacant: endDate ? Math.max(differenceInDays(new Date(), new Date(endDate)), 0) : booking ? Math.max(differenceInDays(new Date(), new Date(booking.date_to)), 0) : 0,
                bookings: siteBookings,
                booking_status: booking?.booking_status,
                adjusted_end_date: adjustment?.adjusted_end_date ?? undefined,
                adjustment_reason: adjustment?.adjustment_reason ?? undefined,
            }
        })
        return contracts;
    }, [sites, bookings, adjustments, isLoading, rentals]);
    return (
        <DataTable columns={columns.filter(column => {
            if (!edit) return column.id !== "action";
            return column;
        })} data={availableSites} size={100} />
    )
}

export default SiteAvailability