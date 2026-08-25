import { SiteAvailability } from '@/interfaces/sites.interface'
import { CellContext } from '@tanstack/react-table'
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { getLatestBooking } from '@/lib/fetch';
import { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
function Cell({ row }: CellContext<SiteAvailability, unknown>) {
    const item = row.original;
    const remaining = item.remaining_days ?? 0;
    const latestBooking = getLatestBooking(item.bookings);

    const statusMap = {
        "QUEUEING": "bg-yellow-100 border-yellow-500 text-yellow-500",
        "AVAILABLE": "bg-red-200/40 border-red-500 text-red-500",
        "BOOKED": "bg-sky-100 text-sky-500 border-sky-500"
    }

    const status = useMemo(() => {
        // Queueing has already finished
        if (remaining <= 0) {
            return "AVAILABLE";
        }

        // Still queueing, within the 60-minute window
        if (latestBooking?.booking_status === "QUEUEING") {
            const difference = differenceInCalendarDays(new Date(), latestBooking.date_from);
            if (difference >= -30) {
                return "BOOKED";
            }

            return "QUEUEING";
        }

        // Normal booking
        if (remaining <= 60) {
            return "AVAILABLE";
        }

        return "BOOKED";
    }, [remaining, latestBooking]);
    return (
        <div>
            <div className='flex items-center gap-1 pb-1'>
                <p className='text-xs font-semibold'>{item.site_code}</p>
                <Badge
                    variant="outline"
                    className={cn('rounded-full uppercase text-[0.6rem] leading-tight px-1.5',
                        statusMap[status]
                    )}>{status}</Badge>
            </div>
            <p className="uppercase text-[0.5rem] leading-tight italic flex flex-col">
                <span>{item.address}</span>
                <span>{item.board_facing}</span>
            </p>
        </div>
    )
}

export default Cell