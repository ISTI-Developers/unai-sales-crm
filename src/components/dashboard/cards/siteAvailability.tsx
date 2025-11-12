import { useMemo } from 'react'
import { pastelColors } from '@/lib/utils';
import BarCard from '../components/bar.card';
import { useAvailableSites, useSites } from '@/hooks/useSites';
import { useBookings } from '@/hooks/useBookings';
import { ChartConfig } from '@/components/ui/chart';

const SiteAvailability = () => {
    const { data: sites } = useSites();
    const { data: available } = useAvailableSites();
    const { data: bookings } = useBookings();

    const bookedSites = useMemo(() => {
        if (!sites || !available || !bookings) return [];

        const availableSites = new Set(available.map(d => d.site));
        const inStoredButNotInAvailable = sites.filter(site => !availableSites.has(site.site_code));

        const mappedStoredSites = inStoredButNotInAvailable.map(item => {
            const booking = bookings.filter(booking => booking.site_code === item.site_code);
            return {
                bookings: booking,
            };
        })

        const mappedAvailableSites = available.map(item => {
            const booking = bookings.filter(booking => booking.site_code === item.site);
            return {
                bookings: booking,

            }
        })

        return [...mappedAvailableSites.filter(site => site.bookings.length > 0), ...mappedStoredSites.filter(site => site.bookings.length > 0)]
    }, [sites, available, bookings]);

    const data = useMemo(() => {
        if (!bookedSites || !sites) return [];
        return [
            {
                label: "OPEN",
                count: sites.length - bookedSites.length,
                fill: pastelColors[15]
            },
            {
                label: "BOOKED",
                count: bookedSites.length,
                fill: pastelColors[1]
            }
        ]
    }, [bookedSites, sites]);

    const config = {
        open: {
            label: "OPEN",
            color: pastelColors[15]
        },
        booked: {
            label: "BOOKED",
            color: pastelColors[15]
        }
    } satisfies ChartConfig;

    return (
        <BarCard config={config} data={data} dk='label' nk='count' title='Site Availability' />
    )
}

export default SiteAvailability