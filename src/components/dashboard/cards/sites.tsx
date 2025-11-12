import { useSites } from '@/hooks/useSites'
import { useMemo } from 'react'
import MetricCard from '@/components/dashboard/components/metric.card';
import { Monitor } from 'lucide-react';

const Sites = () => {
    const { data, isLoading, fetchStatus } = useSites();

    const count = useMemo(() => {
        if (!data || isLoading || fetchStatus === "fetching") return undefined;

        if (!data && !isLoading) return undefined;

        return data.length;
    }, [data, fetchStatus, isLoading])
    
    return (
        <MetricCard icon={Monitor} title='Total Sites' link='sites' count={count} style={{ background: "#d1fae5", color: "#047857" }} />
    )
}

export default Sites