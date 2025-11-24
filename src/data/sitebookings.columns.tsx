/* eslint-disable react-hooks/rules-of-hooks */
import { EditBookingDialog } from "@/components/booking/view.dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBooking, useCancelBooking } from "@/hooks/useBookings";
import { useAccess } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";

export interface SiteBooking {
    ID: number;
    structure_code: string;
    site_code: string;
    area: string;
    address: string;
    size: string;
    facing: string;
    booking_status: string;
    client: string;
    previous_client: string;
    account_executive: string;
    term_duration: string;
    site_rental: number;
    srp: number;
    monthly_rate: number;
    remarks: string
    booking_date: string;
}
export const columns: ColumnDef<SiteBooking>[] = [
    {
        accessorFn: (row) => {
            return `${row.site_code} | ${row.address} | ${row.facing}`;
        },
        id: "structure_code", // give it an id, not accessorKey
        header: "Structure Code",
        cell: ({ row }) => {
            const item = row.original;

            return (
                <div className="text-left space-y-0.5 max-w-[250px] leading-snug">
                    <p className="text-xs font-semibold space-x-1">
                        <span>{item.site_code}</span>
                        <span className="text-[0.5rem]">{`(${item.size})`}</span>
                    </p>
                    <p className={cn("text-[0.5rem] leading-none uppercase font-semibold", item.booking_status === "CANCELLED" ? "text-red-400" : "text-zinc-400")}>
                        {item.address}
                    </p>
                    <p className={cn("text-[0.5rem] uppercase leading-none", item.booking_status === "CANCELLED" ? "text-red-400" : "text-zinc-400")}>
                        {item.facing}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "site_rental",
        header: "Site Rental",
        cell: ({ row }) => {
            const item: string = row.getValue("site_rental");
            return <p className="text-[0.65rem]">{item === "0.00" ? "---" : item}</p>;
        },
    },
    {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => {
            const booking: SiteBooking = row.original;
            return <p className="text-[0.6rem] flex flex-col leading-snug uppercase">
                <span className="font-semibold">{booking.client}</span>
                <span className={cn("text-[0.5rem]", booking.booking_status === "CANCELLED" ? "text-red-400" : "text-zinc-400")}>
                    {booking.client === booking.previous_client ?
                        `Previous: Same`
                        :
                        `Previous: ${booking.previous_client}`
                    }
                </span>
            </p>;
        },
    },
    {
        accessorKey: "term_duration",
        header: "term details",
        cell: ({ row }) => {
            const { access } = useAccess("booking.viewBookings");
            const booking: SiteBooking = row.original;

            return <p className="text-[0.6rem] flex flex-col leading-snug">
                <span>{`${booking.term_duration} ${!access ? `` : `@ ${booking.monthly_rate}`}`}</span>
                {access && <span className="text-[0.5rem]">{`(from SRP of ${booking.srp})`}</span>}
            </p>;
        },
    },
    {
        accessorKey: "account_executive",
        header: "account executive",
        cell: ({ row }) => {
            const id = row.id;
            const item: string = row.getValue("account_executive");
            const accounts = item.split(", ");

            return <p className="text-[0.5rem] flex flex-col leading-snug">
                {accounts.map(acc =>
                    <span key={`${id}_${acc}`}>{acc}</span>
                )}
            </p>;
        },
    },
    {
        accessorKey: "booking_status",
        header: "Status",
        cell: ({ row }) => {
            const item: string = row.getValue("booking_status");
            return <Badge variant={item === "CANCELLED" ? "destructive" : "default"} className="text-[0.5rem] leading-none px-1.5 py-1">{item}</Badge>
        },
    },
    {
        accessorKey: "booking_date",
        header: "Date Created",
        cell: ({ row }) => {
            const item: string = row.getValue("booking_date");
            return <p className="text-[0.5rem]">{format(new Date(item), "PPP")}</p>
        },
    },
    {
        id: "action",
        header: "Actions",
        cell: ({ row }) => {
            const { mutate: cancelBooking } = useCancelBooking();
            const item: SiteBooking = row.original;
            const [open, setOpen] = useState(false);
            const [send, onSend] = useState(false);
            const [reason, setReason] = useState("");
            const { data: booking } = useBooking(item.ID);

            const onContinue = async () => {
                onSend(true);
                cancelBooking({ booking_id: item.ID, reason: reason }, {
                    onSuccess: () => {
                        setOpen(false);
                        onSend(false);
                    },
                });
            };
            return booking && item.booking_status !== "CANCELLED" && (
                <div className="flex items-center justify-center">
                    <EditBookingDialog item={booking} />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 text-red-300 bg-transparent hover:bg-transparent border-none shadow-none"
                                    >
                                        <Ban />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Cancel</TooltipContent>
                        </Tooltip>
                        <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                                <DialogTitle>Cancelation Confirmation</DialogTitle>
                            </DialogHeader>
                            <p>Reason for cancellation:</p>
                            <Textarea disabled={send} value={reason} onChange={(e) => setReason(e.target.value)} />
                            <DialogFooter>
                                <Button disabled={send} variant="destructive" onClick={() => onContinue()}>
                                    {send && <Loader2 className="animate-spin" />} Continue
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )

        }
    }
]