import { useBookings } from '@/hooks/useBookings'
import { useMemo } from 'react'
import MetricCard, { TrendProps } from '@/components/dashboard/components/metric.card';
import { Tag } from 'lucide-react';

const Bookings = () => {
    const { data, isLoading, fetchStatus } = useBookings();

    const count = useMemo(() => {
        if (!data || isLoading || fetchStatus === "fetching") return undefined;

        if (!data && !isLoading) return undefined;

        return data.length;
    }, [data, fetchStatus, isLoading])

    const trend: TrendProps | undefined = useMemo(() => {
        if (!data || isLoading || fetchStatus === "fetching") return undefined;

        const activeBookings = data.filter(item => item.booking_status !== "CANCELLED");
        if (activeBookings.length === 0) return undefined;

        // Group by month (based on modified_date)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const currentMonthBookings = activeBookings.filter(item => {
            const modified = new Date(item.modified_at);
            return modified.getMonth() === currentMonth && modified.getFullYear() === currentYear;
        });

        const previousMonthBookings = activeBookings.filter(item => {
            const modified = new Date(item.modified_at);
            return modified.getMonth() === lastMonth && modified.getFullYear() === lastMonthYear;
        });

        // Compare the count of bookings between months
        const currentCount = currentMonthBookings.length;
        const previousCount = previousMonthBookings.length;

        // Compute rate of change (%)
        const rate =
            previousCount === 0
                ? currentCount > 0
                    ? 100
                    : 0
                : ((currentCount - previousCount) / previousCount) * 100;

        const trend = currentCount >= previousCount ? "up" : "down";

        return {
            rate: Math.round(Math.abs(rate)),
            trend,
            description: `compared from last month`,
        };
    }, [data, fetchStatus, isLoading]);


    return (
        <MetricCard icon={Tag} title='Total Bookings' link='booking' count={count} style={{ background: "#fef3c7", color: "#b45309" }} trend={trend} />
    )
}

export default Bookings