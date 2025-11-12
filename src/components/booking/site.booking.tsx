import { columns } from '@/data/booking.columns';
import { DataTable } from '@/data/data-table';
import { useAccess } from '@/hooks/useClients';

const SiteBookings = () => {
    const { access: edit } = useAccess("booking.update");
    return (
        <DataTable columns={columns.filter(column => {
            if (!edit) return column.id !== "action";
            return column;
        })} data={[]} size={100} />
    )
}

export default SiteBookings