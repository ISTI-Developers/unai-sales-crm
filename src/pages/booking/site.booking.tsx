import { DateRangePicker } from '@/components/ui/daterangepicker';
import { DataTable } from '@/data/data-table';
import { columns } from '@/data/sitebookings.columns';
import { useSiteBookings } from '@/hooks/useBookings'
import { useAccess } from '@/hooks/useClients';
import { format } from 'date-fns';
import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker';

const SiteBookingsTab = () => {
    const [dates, setDates] = useState<DateRange | undefined>(undefined)
    const { data: bookings, isLoading } = useSiteBookings();
    const { access: edit } = useAccess("booking.update");
    const filteredBookings = useMemo(() => {
        if (isLoading || !bookings) return [];

        if (!dates?.from || !dates?.to) return bookings;

        const from = dates!.from;
        const to = dates!.to;

        return bookings.filter(
            (b) => format(new Date(b.booking_date), "yyyy-MM-dd") >= format(from, "yyyy-MM-dd") && format(new Date(b.booking_date), "yyyy-MM-dd") <= format(to, "yyyy-MM-dd")
        );
    }, [bookings, isLoading, dates]);

    const filteredColumns = useMemo(() => {
        if (!edit) return columns.filter(column => column.id !== "action");

        return columns;
    }, [edit])

    if (isLoading || !bookings) return <>Loading...</>
    return (
        <div>
            <DataTable columns={filteredColumns} data={filteredBookings!} className='justify-start gap-4' size={1000} getRowClassName={(row) => {
                if (row.booking_status === "CANCELLED") return "opacity-50 cursor-not-allowed bg-red-100/50 text-red-400 hover:bg-red-100/50 hover:text-red-400 select-none"
                return ""
            }}>
                <DateRangePicker date={dates} onDateChange={setDates} />
            </DataTable>
        </div>
    )
}

export default SiteBookingsTab