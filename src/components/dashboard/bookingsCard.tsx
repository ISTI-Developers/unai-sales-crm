import { useMemo, useState } from 'react'
import { Booking, useBookings } from '@/hooks/useBookings'
import { Skeleton } from '../ui/skeleton';
import { addDays, differenceInDays, differenceInMonths, format, isToday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSites } from '@/hooks/useSites';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { formatAmount } from '@/lib/format';
import { Calendar, MapPin, PhilippinePeso, Quote, User, Users } from 'lucide-react';

type BookingCard = (Booking & { facing: string, address: string, size: string });
const BookingsCard = () => {
    const { data, isLoading } = useBookings();
    const { data: sites } = useSites();
    const [dates, setDates] = useState("today")

    const bookings: BookingCard[] = useMemo(() => {
        if (!data || isLoading || !sites) return []

        let tempBookings = [...data.map(item => {
            return {
                ...item,
                facing: sites.find(site => site.site_code === item.site_code)?.board_facing ?? "---",
                address: sites.find(site => site.site_code === item.site_code)?.address ?? "---",
                size: sites.find(site => site.site_code === item.site_code)?.size ?? "---",
            }
        })];

        tempBookings = tempBookings.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        if (dates === "past 30 days") {
            return tempBookings.filter(booking => differenceInDays(new Date(), new Date(booking.created_at)) <= 31);
        }
        if (dates === "past 7 days") {
            return tempBookings.filter(booking => differenceInDays(new Date(), new Date(booking.created_at)) <= 7);
        }

        return tempBookings.filter(booking => format(new Date(booking.created_at), "MMMM dd, yyyy") === format(new Date(), "MMMM dd, yyyy"));

    }, [data, isLoading, dates, sites])
    return (
        <>
            <div className="flex items-center justify-between gap-1.5 sticky top-0 bg-white">
                <p>Site Bookings</p>
                <Select value={dates} onValueChange={setDates}>
                    <SelectTrigger className='w-fit capitalize'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["today", "past 7 days", "past 30 days"].map(option => {
                            return <SelectItem key={option} value={option} className='capitalize'>{option}</SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </div>
            <div className='px-4 pt-2 flex flex-col gap-2'>
                {isLoading ? (
                    <Skeleton className="w-full h-12" />
                ) : (
                    <>
                        {bookings.length > 0 ? bookings.map(booking => {
                            return <Dialog key={booking.ID}>
                                <BookingsCardItem booking={booking} />
                            </Dialog>
                        }) : <p className='text-center pb-4 text-zinc-600'>No bookings found.</p>}
                    </>
                )}
            </div>
        </>
    )
}

const BookingsCardItem = ({ booking }: { booking: BookingCard }) => {
    const dateSubmitted = new Date(booking.created_at);
    let timestamp = format(dateSubmitted, "MM/dd p");
    if (isToday(dateSubmitted)) {
        timestamp = format(dateSubmitted, "p");
    }
    return <>
        <DialogTrigger asChild>
            <div role='button' className='grid grid-cols-[1fr_auto] hover:bg-slate-50 text-sm py-1.5 gap-1'>
                <div className='flex gap-2'>
                    <p className='font-bold'>{booking.site_code}</p>
                    <Badge>{booking.booking_status}</Badge>
                </div>
                <p className='text-xs text-zinc-500'>{timestamp}</p>
                <p className='text-xs uppercase italic text-zinc-500'>{booking.facing}</p>
            </div>
        </DialogTrigger>
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
    </>
}

export default BookingsCard