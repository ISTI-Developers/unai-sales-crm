import { columns } from "@/data/bookings.columns";
import ResponsiveTable from '@/data/responsive-table';
import useAvailableSites from "@/hooks/useAvailableSites";
const SiteAvailability = () => {
    const availableSites = useAvailableSites();
    return (
        <ResponsiveTable columns={columns} data={availableSites} size={100} />
    )
}

export default SiteAvailability