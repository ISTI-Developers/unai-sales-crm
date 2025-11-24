import { BookingCard } from '@/components/dashboard/bookingsCard';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/daterangepicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/data/data-table';
import { columns } from '@/data/sitebookings.columns';
import { useBooking, useSiteBookings } from '@/hooks/useBookings'
import { useAccess } from '@/hooks/useClients';
import { useSite } from '@/hooks/useSites';
import { formatAmount } from '@/lib/format';
import { addDays, differenceInMonths, format } from 'date-fns';
import { Calendar, MapPin, PhilippinePeso, Quote, User, Users } from 'lucide-react';
import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker';
import { SetURLSearchParams, useSearchParams } from 'react-router-dom';

const SiteBookingsTab = () => {
    const [dates, setDates] = useState<DateRange | undefined>(undefined)
    const { data: bookings, isLoading } = useSiteBookings();
    const { access: edit } = useAccess("booking.update");

    const [params, setParams] = useSearchParams();

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
            {params.get("b") && <BookingPreview id={Number(params.get("b"))} setParams={setParams} />}
        </div>
    )
}

const BookingPreview = ({ id, setParams }: { id?: number; setParams: SetURLSearchParams }) => {
    const { data: record } = useBooking(id);
    const { data: site } = useSite(record?.site_code)
    const [open, setOpen] = useState(false);

    const booking = useMemo(() => {
        if (!record || !site) return;

        setOpen(true);

        return {
            ...record,
            facing: site.board_facing,
            address: site.address,
        }
    }, [record, site])

    const onOpenChange = (val: boolean) => {
        setOpen(val);
        setParams({ t: "bookings" })
    }

    return <Dialog open={open} onOpenChange={onOpenChange}>
        {booking &&
            <DialogContent className='max-w-2xl' showClose={false}>
                <DialogHeader aria-description={undefined}>
                    <div className='flex justify-between'>
                        <DialogTitle>Booking Details</DialogTitle>
                        <Badge>{booking.booking_status}</Badge>
                    </div>
                </DialogHeader>
                <div className='flex flex-col gap-1'>
                    <div className='bg-slate-100 p-4 px-5 rounded'>
                        <p className='space-x-2'><span className='font-semibold'>{booking.site_code}</span>
                            <span className='text-[0.65rem] italic'>({booking.facing})</span></p>
                        <p className='text-sm flex gap-1 items-center'><MapPin size={16} strokeWidth={3} />{booking.address}</p>
                        {/* <p className='text-sm'><span className='font-semibold'>Size (H x W): </span><span>{booking.size}</span></p> */}
                    </div>
                    <Separator />
                    <div className='grid grid-cols-2 text-sm pt-2'>
                        <div className='flex flex-col gap-2'>
                            <div>
                                <p className='font-bold uppercase flex items-center gap-1'><Users size={16} strokeWidth={3} />Client:</p>
                                <p>{booking.client}</p>
                            </div>
                            <div>
                                <p className='font-bold uppercase flex items-center gap-1'><User size={16} strokeWidth={3} />AE/s:</p>
                                <p>{booking.account_executive}</p>
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div>
                                <p className='font-bold uppercase flex items-center gap-1'><Calendar size={16} strokeWidth={3} />Term Duration:</p>
                                <p>{`${differenceInMonths(addDays(new Date(booking.date_to), 1), new Date(booking.date_from))}mo/s (${format(new Date(booking.date_from), "MMM dd")} - ${format(new Date(booking.date_to), "MMM dd, yyyy")})`}</p>
                            </div>
                            <div>
                                <p className='font-bold uppercase flex items-center gap-1'><PhilippinePeso size={16} strokeWidth={3} />Site Rental:</p>
                                <p>{formatAmount(booking.site_rental)}</p>
                            </div>
                            <div>
                                <p className='font-bold uppercase flex items-center gap-1'><PhilippinePeso size={16} strokeWidth={3} />Monthly Rate:</p>
                                <p>{formatAmount(booking.monthly_rate)} <span className='italic text-xs text-slate-500'>(from SRP of {formatAmount(booking.srp)})</span></p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className='text-sm'>
                        <p className='font-bold uppercase flex items-center gap-1'><Quote size={16} strokeWidth={3} />Remarks</p>
                        <p>{booking.remarks}</p>
                    </div>
                </div>
            </DialogContent>
        }
    </Dialog>
}
export default SiteBookingsTab