import { useClients } from '@/hooks/useClients'
import MetricCard, { TrendProps } from '@/components/dashboard/components/metric.card';
import { useMemo } from 'react'
import { BookUser } from 'lucide-react';
import { useAuth } from '@/providers/auth.provider';

const Clients = () => {
    const { data, isLoading } = useClients();
    const { user } = useAuth();

    const count = useMemo(() => {
        if (!data || isLoading || !user) return undefined;
        const roleID = Number(user.role.role_id);
        const companyID = Number(user.company?.ID);
        if ([1, 10, 11].includes(roleID)) {
            return data.length;
        }
        const companyClients = data.filter(d => d.company_id === companyID);
        if (roleID === 4 || roleID === 5) {
            return companyClients.filter(c => c.sales_unit_id === user.sales_unit?.sales_unit_id).length;
        }

        return companyClients.length;
    }, [data, isLoading, user])

    const trend: TrendProps | undefined = useMemo(() => {
        if (!data || isLoading) return undefined;

        // Group by month (based on modified_date)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();


        const currentMonthBookings = data.filter(item => {
            const modified = new Date(item.created_at);
            return modified.getMonth() === currentMonth && modified.getFullYear() === currentYear;
        });

        const previousMonthBookings = data.filter(item => {
            const modified = new Date(item.created_at);
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
    }, [data, isLoading]);

    return (
        <MetricCard icon={BookUser} link='clients' title="Total Clients" count={count} style={{ background: "#dbeafe", color: "#1e40af" }} trend={trend} />
    )
}

export default Clients