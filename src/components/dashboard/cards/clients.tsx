import { useClients } from '@/hooks/useClients'
import MetricCard, { TrendProps } from '@/components/dashboard/components/metric.card';
import { useMemo } from 'react'
import { BookUser } from 'lucide-react';
import { useAuth } from '@/providers/auth.provider';

const Clients = () => {
    const { data, isLoading } = useClients();
    const { user } = useAuth();

    const cleanedUpClients = useMemo(() => {
        if (!data || isLoading) return undefined;

        const uniqueClients = Array.from(
            new Map(
                data.map(client => [
                    client.parent_id !== null
                        ? `parent-${client.parent_id}`
                        : `name-${client.name.trim().toLowerCase()}`,
                    client
                ])
            ).values()
        );

        return uniqueClients;

    }, [data, isLoading])
    const count = useMemo(() => {
        if (!cleanedUpClients || !user) return undefined;
        const roleID = Number(user.role.role_id);
        const companyID = Number(user.company?.ID);
        if ([1, 10].includes(roleID)) {
            return cleanedUpClients.length;
        }
        const companyClients = cleanedUpClients.filter(d => d.company_id === companyID);

        if (user.sales_unit?.sales_unit_id) {
            return companyClients.filter(c => c.sales_unit_id === user.sales_unit!.sales_unit_id).length;
        }

        return companyClients.length;
    }, [cleanedUpClients, user])

    const trend: TrendProps | undefined = useMemo(() => {
        if (!cleanedUpClients) return undefined;

        // Group by month (based on modified_date)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();


        const currentMonthBookings = cleanedUpClients.filter(item => {
            const modified = new Date(item.created_at);
            return modified.getMonth() === currentMonth && modified.getFullYear() === currentYear;
        });

        const previousMonthBookings = cleanedUpClients.filter(item => {
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
    }, [cleanedUpClients]);

    return (
        <MetricCard icon={BookUser} link='clients' title="Total Clients" count={count} style={{ background: "#dbeafe", color: "#1e40af" }} trend={trend} />
    )
}

export default Clients