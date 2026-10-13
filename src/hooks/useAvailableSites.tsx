import { useMemo } from "react";
import { useSiteRentals, useSites } from "./useSites";
import { useBookings } from "./v2/useBookings";
import { Availability } from "@/interfaces/bookings.interface";

function useAvailableSites() {
    const { data: sites = [] } = useSites();
    const { data: bookings = [], isLoading } = useBookings();
    const { data: rentals = [] } = useSiteRentals();

    const availableSites: Availability[] = useMemo(() => {
        if (isLoading) return [];

        const contracts = sites.map(site => {
            const siteBookings = bookings.filter(booking => booking.site_code === site.site_code);
            const updatedBookings = siteBookings.map(sb => ({ ...sb, is_prime: site.is_prime }))

            const siteRental = rentals.find(rent => rent.site_code === site.site_code);
            return {
                ID: site.ID,
                site_code: site.site_code,
                address: site.address,
                board_facing: site.board_facing,
                site_owner: site.site_owner,
                region: site.region,
                city: site.city,
                area: site.city,
                size: site.size,
                site_rental: siteRental?.site_rental ?? 0,
                srp: Number(site.price),
                remarks: site.remarks,
                status: site.status,
                bookings: updatedBookings,
            }
        })
        return contracts;
    }, [sites, bookings, isLoading, rentals]);

    return availableSites;
}

export default useAvailableSites