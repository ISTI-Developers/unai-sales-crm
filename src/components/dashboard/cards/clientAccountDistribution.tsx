import { useMemo } from 'react'
import { useClients } from '@/hooks/useClients';
import { ChartConfig } from '@/components/ui/chart';
import { Client } from '@/interfaces/client.interface';
import { pastelColors } from '@/lib/utils';
import BarCard from '../components/bar.card';
import { useAuth } from '@/providers/auth.provider';

const ClientAccountDistribution = () => {
    const { data: clients, isLoading } = useClients();
    const { user } = useAuth();

    const filteredClients = useMemo(() => {
        if (!clients || isLoading || !user) return undefined;
        const roleID = Number(user.role.role_id);
        const companyID = Number(user.company?.ID);
        if ([1, 3, 10, 11].includes(roleID)) {
            return clients;
        }
        const companyClients = clients.filter(d => d.company_id === companyID);

        if (roleID === 4 || roleID === 5) {
            return companyClients.filter(c => c.sales_unit_id === user.sales_unit?.sales_unit_id);
        }

        return companyClients;
    }, [clients, isLoading, user])

    const [data, config] = useMemo(() => {
        if (!filteredClients || isLoading || !user) return [[], {} as ChartConfig];

        // ✅ Group clients by unit
        const groupedClients = filteredClients.reduce((prev, curr) => {
            const unit = [1, 3, 10, 11].includes(user.role.role_id) ? curr.sales_unit : (curr.account_code || "Unknown").toUpperCase(); // fallback
            if (!prev[unit]) prev[unit] = [];
            prev[unit].push(curr);
            return prev;
        }, {} as Record<string, Client[]>);

        // ✅ Build chart config dynamically (colors + labels)
        const chartConfig = Object.keys(groupedClients).reduce((acc, unit, index) => {
            const key = unit
                .replace(/\s+/g, "")
                .replace(/\//g, "")
                .replace(/[^\w]/g, "")
                .toLowerCase();

            acc[key] = {
                label: unit,
                color: pastelColors[index] ?? "#e5e7eb",
            };

            return acc;
        }, {} as ChartConfig);

        // ✅ Build dataset (count per unit)
        const data = Object.keys(groupedClients).map((unit) => ({
            key: unit
                .replace(/\s+/g, "")
                .replace(/\//g, "")
                .replace(/[^\w]/g, "")
                .toLowerCase(),
            unit: unit,
            count: groupedClients[unit].length,
            fill: chartConfig[
                unit
                    .replace(/\s+/g, "")
                    .replace(/\//g, "")
                    .replace(/[^\w]/g, "")
                    .toLowerCase()
            ].color,
        }));

        return [data, chartConfig];
    }, [filteredClients, user, isLoading]);

    return (
        <BarCard config={config} data={data} dk='unit' nk='count' title='Client Unit Distribution' />
    )
}

export default ClientAccountDistribution