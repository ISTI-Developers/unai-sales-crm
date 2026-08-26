import { SiteAvailability } from "@/interfaces/sites.interface"
import { getBookingContext } from "@/lib/fetch";
import { CellContext } from "@tanstack/react-table"
import { differenceInCalendarDays, format } from "date-fns";

function DateCell({ row }: CellContext<SiteAvailability, unknown>) {
    const site = row.original;
    const bookings = site.bookings;
    const siteBookings = bookings.map(sb => ({ ...sb, is_prime: site.is_prime }));
    const { current, previous } = getBookingContext(siteBookings);

    let endDate = site.end_date ? format(new Date(site.end_date), "PPP") : site.end_date;
    if (current?.booking_status === "QUEUEING") {
        const difference = differenceInCalendarDays(new Date(), current.date_from);
        if (difference >= -30) {
            endDate = format(new Date(current.date_to), "PPP");
        } else {
            endDate = format(new Date(previous?.date_to ?? new Date()), "PPP")
        }
    }

    return (
        <div className="relative group text-[.6rem] text-start px-2 whitespace-nowrap">
            {endDate}
        </div>
    )
}

export default DateCell