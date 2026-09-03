import { useMemo } from "react";
import { useBookings } from "./useBookings";
import { useSiteRentals, useSites } from "./useSites";
import { differenceInCalendarDays } from "date-fns";
import { splitClientName } from "@/lib/format";
import { getEndDate, getLatestBooking } from "@/lib/fetch";
import { SiteAvailability } from "@/interfaces/sites.interface";

function useAvailableSites() {
    const { data: sites } = useSites();
    const { data: bookings, isLoading } = useBookings();
    const { data: rentals } = useSiteRentals();

    const availableSites: SiteAvailability[] = useMemo(() => {
        if (!sites || !bookings || isLoading || !rentals) return [];

        const activeSites = sites.filter(site => site.status === 1);

        const contracts = activeSites.map(site => {
            const siteBookings = bookings.filter(booking => booking.site_code === site.site_code);
            const updatedBookings = siteBookings.map(sb => ({ ...sb, is_prime: site.is_prime }))

            const booking = getLatestBooking(updatedBookings);
            const endDate = getEndDate(booking);
            const siteRental = rentals.find(rent => rent.site_code === site.site_code);
            const { client, product } = splitClientName(booking ? booking.client : "");
            return {
                ...site,
                site_rental: siteRental ? siteRental.site_rental : booking ? booking.site_rental : 0,
                client: client,
                product: product,
                date_from: booking?.date_from,
                end_date: endDate,
                remaining_days: endDate ? Math.max(differenceInCalendarDays(new Date(endDate), new Date()), 0) : booking ? Math.max(differenceInCalendarDays(new Date(booking.date_to), new Date()), 0) : 0,
                days_vacant: endDate ? Math.max(differenceInCalendarDays(new Date(), new Date(endDate)), 0) : booking ? Math.max(differenceInCalendarDays(new Date(), new Date(booking.date_to)), 0) : 0,
                bookings: siteBookings,
                booking_status: booking?.booking_status
            }
        })
        return contracts;
    }, [sites, bookings, isLoading, rentals]);

    return availableSites;
}

export default useAvailableSites