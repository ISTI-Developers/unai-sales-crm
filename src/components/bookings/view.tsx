import { SiteAvailability } from '@/interfaces/sites.interface'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Ban, FileText, Loader2, Pen } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { capitalize, cn } from '@/lib/utils';
import { Booking, useCancelBooking, useUpdateBooking } from '@/hooks/useBookings';
import { useUsers } from '@/hooks/useUsers';
import { formatAmount, formatTermDetails } from '@/lib/format';
import { Notification, sendNotification } from '@/hooks/useNotifications';
import { Textarea } from '../ui/textarea';
import { differenceInDays } from 'date-fns';
import InputNumber from '../ui/number-input';
import { useAuth } from '@/providers/auth.provider';
import { v4 } from 'uuid';
import { List } from '@/interfaces';
import { MultiComboBox } from '../multicombobox';

function ViewBooking({ site }: { site: SiteAvailability }) {
    const [openBooking, setOpenBooking] = useState(false);
    const [show, onShow] = useState(true);
    const headers = ["status", "client", "AE", "SRP", "term details", "action"];
    const siteBookings = site.bookings.map(sb => ({ ...sb, is_prime: site.is_prime }))

    const bookings = useMemo(() => {
        return siteBookings
            .filter((item) => (!show ? item.booking_status !== "CANCELLED" : true))
            .sort((a, b) => {
                // Put CANCELLED at the end
                if (
                    a.booking_status === "CANCELLED" &&
                    b.booking_status !== "CANCELLED"
                )
                    return 1;
                if (
                    a.booking_status !== "CANCELLED" &&
                    b.booking_status === "CANCELLED"
                )
                    return -1;
                // Otherwise, sort by date_from descending (latest first)
                return b.ID - a.ID;
            });
    }, [siteBookings, show]);
    return (
        <Dialog open={openBooking} onOpenChange={setOpenBooking} modal={false}>
            <Tooltip>
                <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button className='p-1.5 h-auto bg-yellow-400 hover:bg-yellow-600 text-white hover:text-white' variant="ghost" size="sm">
                            <FileText />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>
            {openBooking && <div onClick={() => setOpenBooking(false)} className='fixed inset-0 pointer-events-all bg-black/20 z-30' />}
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{site.site_code} Booking Records</DialogTitle>
                    <DialogDescription>
                        <div className="py-1 flex items-center gap-2">
                            <Switch checked={show} onCheckedChange={onShow} />
                            <Label>Show cancelled bookings</Label>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <main>
                    {site.bookings.length === 0 ? <>No bookings found for this site.</> :
                        bookings &&
                        <Table>
                            <TableCaption>End of list</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    {headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header}
                                                className={cn(
                                                    "uppercase text-xs font-bold",
                                                    header === "action" ? "text-center" : ""
                                                )}
                                            >
                                                {header}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((item) => {
                                    return (
                                        <BookingItem item={item} key={`${item.site_code}-${item.ID}`} show={show}  />
                                    );
                                })}
                            </TableBody>
                        </Table>}
                </main>
            </DialogContent>
        </Dialog>
    )
}

const BookingItem = ({ item, show }: { item: Booking; show: boolean; }) => {
    const { data: users } = useUsers();
    const { mutate: cancelBooking } = useCancelBooking();
    const [open, setOpen] = useState(false);
    const [send, onSend] = useState(false);
    const [reason, setReason] = useState("");
    const termDetails = formatTermDetails(
        item.date_from,
        item.date_to,
        item.monthly_rate
    );
    const status = useMemo(() => {
        const invalid = ["CANCELLED", "PRE-TERMINATION"];
        const now = new Date();

        const start = new Date(item.date_from);
        const end = new Date(item.date_to);

        const isRunning =
            start <= now &&
            end >= now;

        const isFuture =
            start > now;

        // invalid statuses first
        if (item.booking_status === "PRE-TERMINATION") {
            return "PRE-TERMINATED";
        }

        if (item.booking_status === "CANCELLED") {
            return "CANCELLED";
        }

        // active booking
        if (isRunning) {
            return "RUNNING";
        }

        // future booking
        if (isFuture) {
            return "UPCOMING";
        }

        // already ended
        if (end < now && !invalid.includes(item.booking_status)) {
            return "COMPLETED";
        }

        return "STOPPED";
    }, [item]);

    const onContinue = async () => {
        onSend(true);
        cancelBooking({ booking_id: item.ID, reason: reason }, {
            onSuccess: async (data, variables) => {
                if (data?.acknowledged) {

                    setOpen(false);
                    onSend(false);

                    if (!users) return;
                    const body = `Site ${item.site_code}'s booking has been cancelled.`;

                    const notification: Notification = {
                        title: "Booking Cancellation",
                        recipients: [...users.filter(user => user.role.role_id in [1, 3, 4, 5, 10, 13]).map(user => Number(user.ID))],
                        body: body,
                        tag: "booking-cancellation",
                        data: {
                            url: `/booking?t=bookings&b=${variables.booking_id}`,
                        },
                    }
                    await sendNotification(notification);

                }

            },
        });
    };

    return (
        <TableRow
            className={cn(
                "text-xs h-10",

                show && status === "CANCELLED" &&
                "bg-red-50 text-red-300",

                ["COMPLETED", "STOPPED"].includes(status) &&
                "opacity-50 pointer-events-none",

                status === "PRE-TERMINATED" &&
                "bg-amber-50 text-amber-700",

                status === "RUNNING" &&
                "bg-emerald-100 hover:bg-emerald-200 text-emerald-600",
            )}
        >
            <TableCell className="font-semibold whitespace-nowrap">
                <div>
                    <p>{status}</p>
                    {/* <p className='font-normal italic text-[0.65rem]'>{status !== item.booking_status && item.booking_status}</p> */}
                </div>
            </TableCell>
            <TableCell className='text-[0.65rem]'>{item.client}</TableCell>
            <TableCell className='text-[0.65rem]'>{item.account_executive}</TableCell>
            <TableCell className='text-[0.65rem]'>{formatAmount(item.srp)}</TableCell>
            <TableCell className='text-[0.65rem]'>{termDetails}</TableCell>
            <TableCell align="center">
                {!['CANCELLED', 'PRE-TERMINATED', 'COMPLETED', 'STOPPED'].includes(status) && (
                    <div className="flex items-center justify-center">
                        <EditBookingDialog item={item} />
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
                                    <Button disabled={send} variant="destructive" onClick={onContinue}>
                                        {send && <Loader2 className="animate-spin" />} Continue
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
};
export const EditBookingDialog = ({ item }: { item: Booking }) => {
    const { user } = useAuth();
    const { data: users, isLoading } = useUsers();
    const { mutate: updateBooking } = useUpdateBooking();
    const [booking, setBooking] = useState({
        ...item,
        account_executive: [] as List[],
        date_from: new Date(item.date_from),
        date_to: new Date(item.date_to)
    })
    const [open, setOpen] = useState(false);
    const [send, onSend] = useState(false);

    const canSubmit = useMemo(() => {
        return booking.client.length > 0 && booking.account_executive.length > 0 && differenceInDays(booking.date_to, booking.date_from) > 1;
    }, [booking]);

    const salesUnits = useMemo<List[]>(() => {
        if (!users || isLoading) return [];
        const sales = users
            .filter(
                (item) =>
                    item.company?.ID === user?.company?.ID && item.sales_unit !== null
            )
            ?.map((user) => {
                return {
                    id: String(user.ID),
                    value: capitalize(`${user.first_name} ${user.last_name}`),
                    label: capitalize(`${user.first_name} ${user.last_name}`),
                };
            });

        return [...sales, { id: v4(), value: "Other (JV Partner)", label: "Other (JV Partner)" }, { id: v4(), value: "Others (In-house account)", label: "Others (In-house account)" }]
    }, [users, isLoading, user]);

    useEffect(() => {
        if (salesUnits.length === 0) return;
        const AEs = salesUnits.filter(sales => item.account_executive.split(",").some(ae => ae.trim() === sales.label));
        setBooking((prev) => {
            return {
                ...prev,
                account_executive: AEs
            }
        })
    }, [item.account_executive, salesUnits])
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSend(true)
        const updatedBooking = {
            ...booking,
            account_executive: booking.account_executive.map(ae => ae.value).join(", "),
        }
        updateBooking(updatedBooking, {
            onSuccess: async () => {
                onSend(false);
                setOpen(false);
                // if (data.acknowledged) {
                //     if (!users) return;
                //     let body = `There's a change in ${booking.site_code}'s contract details.`;

                //     if (variables.booking_status === "CANCELLED") {
                //         body = `Site ${booking.site_code}'s booking has been cancelled.`
                //     } else if (variables.booking_status === "QUEUEING") {
                //         body = `A reservation for site ${booking.site_code} has been made.`
                //     } else if (variables.booking_status === "RENEWAL") {
                //         body = `Site ${booking.site_code}'s booking has been renewed.`
                //     } else if (variables.booking_status === "PRE-TERMINATION") {
                //         body = `Site ${booking.site_code} has been pre-terminated.`;
                //     }

                //     const notification: Notification = {
                //         title: "Booking Update",
                //         recipients: [...users.filter(user => user.role.role_id in [1, 3, 4, 5, 10, 13]).map(user => Number(user.ID))],
                //         body: body,
                //         tag: "booking-update",
                //         data: {
                //             url: `/booking?t=bookings&b=${variables.ID}`,
                //         },
                //     }
                //     await sendNotification(notification);

                // }
            },
            onError: () => {
                onSend(false);
            }
        })
    }
    return <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-yellow-300 bg-transparent hover:bg-transparent border-none shadow-none"
                    >
                        <Pen />
                    </Button>
                </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Booking Details</DialogTitle>
                <DialogDescription>This form is only used for basic booking detail adjustments such as AE/s, monthly rate and remarks.</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                <div>
                    <Label htmlFor="ae" className='text-xs'>Account Executive</Label>
                    <MultiComboBox
                        disabled={send}
                        title="account executive"
                        list={salesUnits}
                        value={booking.account_executive}
                        setValue={(id) => {
                            setBooking((prev) => {
                                const current = prev.account_executive ?? [];
                                const exists = current.some((item) => item.id === id);

                                if (exists) {
                                    return {
                                        ...prev,
                                        account_executive: current.filter((item) => item.id !== id),
                                    };
                                }

                                const found = salesUnits.find((item) => item.id === id);

                                return found
                                    ? {
                                        ...prev,
                                        account_executive: [...current, found],
                                    }
                                    : prev;
                            });
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1"><Label htmlFor="monthly_rate">Monthly Rate</Label>
                    <InputNumber
                        disabled={send}
                        id="monthly_rate"
                        value={booking.monthly_rate}
                        onChange={(e) => setBooking((prev) => ({
                            ...prev,
                            [e.target.id]: e.target.value,
                        }))}
                    /></div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                        id="remarks"
                        value={booking.remarks}
                        disabled={send}
                        onChange={(e) =>
                            setBooking((prev) => ({
                                ...prev,
                                [e.target.id]: e.target.value,
                            }))
                        }
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        type="submit"
                        disabled={send || !canSubmit}
                        className={
                            "bg-main-100 hover:bg-main-700 text-white hover:text-white"
                        }
                    >
                        {send && <Loader2 className="animate-spin" />}
                        Continue
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}

export default ViewBooking