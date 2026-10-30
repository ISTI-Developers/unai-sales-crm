import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getBookingContext, isQueueing, statusMap } from "@/hooks/v2/useBookings";
import { Availability } from "@/interfaces/bookings.interface"
import { cn } from "@/lib/utils";
import { CellContext } from "@tanstack/react-table"
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { useMemo } from "react";

function SiteCode({ row }: CellContext<Availability, unknown>) {
    const site = row.original;
    const bookings = site.bookings;
    const { current, next } = getBookingContext(bookings);

    const { status, availability } = useMemo(() => {

        // console.log({ current, previous, next });

        if (next) {
            if (next.booking_status === "RENEWAL") {
                return {
                    status: "BOOKED",
                    availability: addDays(new Date(next.date_to), 1)
                };
            }

            if (isQueueing(next)) {
                return {
                    status: "QUEUEING",
                    availability: new Date(next.date_from)
                };
            }
            
            if (differenceInCalendarDays(new Date(next.date_from), new Date()) < 30) {
                return {
                    status: "BOOKED",
                    availability: addDays(new Date(next.date_to), 1)
                };
            }
        }

        if (current) {
            if (isQueueing(current)) {
                return {
                    status: "QUEUEING",
                    availability: new Date(current.date_from)
                };
            } else {
                const difference = differenceInCalendarDays(new Date(current.date_to), new Date());
                if (difference > 60) {
                    return {
                        status: "BOOKED",
                        availability: addDays(new Date(current.date_to), 1)
                    };
                }
            }

            return {
                status: "AVAILABLE",
                availability: addDays(new Date(current.date_to), 1)
            };
        }

        if (next && !current) {
            return {
                status: "BOOKED",
                availability: addDays(new Date(next.date_to), 1)
            };
        }

        return {
            status: "AVAILABLE",
            availability: new Date()
        };
    }, [current, next]);
    return (
        <div>
            <div className="flex items-center gap-1 pb-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("rounded-full size-2 bg-black mt-1", site.status === 1 && "bg-emerald-300", site.status === 2 && "bg-red-300")} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {site.status === 1 && "Active"}
                        {site.status === 2 && "Inactive"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <p className="text-xs font-semibold pt-1">{site.site_code}</p>
                    <TooltipTrigger>
                        <Badge
                            variant="outline"
                            className={cn('rounded-full uppercase text-[0.55rem] leading-tight px-1.5',
                                statusMap[status as keyof typeof statusMap]
                            )}>{status}</Badge>
                    </TooltipTrigger>
                    {status !== "AVAILABLE" &&
                        <TooltipContent>
                            {status === "QUEUEING" ? `Available until ${format(availability, "PPP")}` : `Available on ${format(availability, "PPP")}`}
                        </TooltipContent>
                    }
                </Tooltip>
            </div>
            <p className="uppercase text-[0.5rem] leading-tight italic flex flex-col">
                <span>{site.address}</span>
                <span>{site.board_facing}</span>
            </p>
        </div>
    )
}

export default SiteCode