import { useMemo } from 'react'
import PieCard from '../components/pie.card'
import { useClients } from '@/hooks/useClients';
import { ChartConfig } from '@/components/ui/chart';
import { Client } from '@/interfaces/client.interface';
import { pastelColors } from '@/lib/utils';
import { useAuth } from '@/providers/auth.provider';

const ClientStatusDistribution = () => {
    const { data: clients, isLoading } = useClients();
    const { user } = useAuth();

    const filteredClients = useMemo(() => {
        if (!clients || isLoading || !user) return undefined;
        const roleID = Number(user.role.role_id);
        const companyID = Number(user.company?.ID);
        if ([1, 10, 11].includes(roleID)) {
            return clients;
        }
        const companyClients = clients.filter(d => d.company_id === companyID);
        if (roleID === 4 || roleID === 5) {
            return companyClients.filter(c => c.sales_unit_id === user.sales_unit?.sales_unit_id);
        }

        return companyClients;
    }, [clients, isLoading, user])

    const [data, config] = useMemo(() => {
        if (!filteredClients || isLoading) return [[], {} as ChartConfig];

        // ✅ Group clients by status
        const groupedClients = filteredClients.reduce((prev, curr) => {
            const status = curr.status_name || "Unknown"; // fallback
            if (!prev[status]) prev[status] = [];
            prev[status].push(curr);
            return prev;
        }, {} as Record<string, Client[]>);

        // ✅ Build chart config dynamically (colors + labels)
        const chartConfig = Object.keys(groupedClients).reduce((acc, status, index) => {
            const key = status
                .replace(/\s+/g, "")
                .replace(/\//g, "")
                .replace(/[^\w]/g, "")
                .toLowerCase();

            acc[key] = {
                label: status,
                color: pastelColors[index] ?? "#e5e7eb",
            };

            return acc;
        }, {} as ChartConfig);

        // ✅ Build dataset (count per status)
        const data = Object.keys(groupedClients).map((status) => ({
            key: status
                .replace(/\s+/g, "")
                .replace(/\//g, "")
                .replace(/[^\w]/g, "")
                .toLowerCase(),
            status: status,
            count: groupedClients[status].length,
            fill: chartConfig[
                status
                    .replace(/\s+/g, "")
                    .replace(/\//g, "")
                    .replace(/[^\w]/g, "")
                    .toLowerCase()
            ].color,
        }));

        return [data, chartConfig];
    }, [filteredClients, isLoading]);
    return (
        <PieCard config={config} data={data} dk='count' nk='status' title='Client Status Distribution' />
    )
}

export default ClientStatusDistribution