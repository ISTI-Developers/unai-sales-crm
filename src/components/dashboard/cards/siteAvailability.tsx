import { useMemo } from 'react'
import { pastelColors } from '@/lib/utils';
import BarCard from '../components/bar.card';
import { useSites } from '@/hooks/useSites';
import { useBookings } from '@/hooks/useBookings';
import { ChartConfig } from '@/components/ui/chart';
import { getEndDate, getLatestBooking } from '@/lib/fetch';
import { differenceInDays } from 'date-fns';

const SiteAvailability = () => {
    const { data: sites } = useSites();
    const { data: bookings } = useBookings();

    const bookedSites = useMemo(() => {
        if (!sites || !bookings) return [];

        const endDates = sites.map(item => {
            const siteBookings = bookings.filter(booking => booking.site_code === item.site_code)

            const currentBooking = getLatestBooking(siteBookings);
            const endDate = getEndDate(currentBooking);
            return endDate;
        })

        return endDates.filter(date => {
            if(!date) return false;

            return differenceInDays(new Date(date),new Date()) > 60;
        })
    }, [sites, bookings]);

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