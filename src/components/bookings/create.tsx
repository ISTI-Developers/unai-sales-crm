import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Loader2, Tag } from 'lucide-react';
import { SiteAvailability } from '@/interfaces/sites.interface';
import { Label } from '../ui/label';
import InputNumber from '../ui/number-input';
import { List } from '@/interfaces';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/providers/auth.provider';
import { capitalize } from '@/lib/utils';
import { v4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { MultiComboBox } from '../multicombobox';
import { DatePicker } from '../ui/datepicker';
import { Textarea } from '../ui/textarea';
import { addDays, differenceInDays } from 'date-fns';
import { useCreateBooking } from '@/hooks/useBookings';
import { toast } from '@/hooks/use-toast';
import { Notification, sendNotification } from '@/hooks/useNotifications';
import { getLatestBooking } from '@/lib/fetch';
// import SelectSearch from '../ui/select-search';
// import { useClients } from '@/hooks/useClients';

const formConfig = {
    "PRE-TERMINATION": ['end', 'remarks'],
    "CHANGE OF CONTRACT PERIOD/DURATION": ['start', 'end', 'remarks'],
}

function CreateBooking({ site }: { site: SiteAvailability }) {
    const { user } = useAuth();
    const [openBooking, setOpenBooking] = useState(false);
    const { data: users, isLoading: isUsersLoading } = useUsers();
    const { mutate: createBooking } = useCreateBooking(site.site_code)
    const [send, onSend] = useState(false);
    const [booking, setBooking] = useState({
        srp: site.price,
        booking_status: (site?.remaining_days ?? 0) > 60 ? "RENEWAL" : "NEW",
        client: (site?.remaining_days ?? 0) > 60 ? `${site.client} ${site.product ? `(${site.product})` : ``}` : "",
        account_executive: [] as List[],
        start: site.end_date ? addDays(new Date(site.end_date), 1) : new Date(),
        end: site.end_date ? addDays(new Date(site.end_date), 1) : new Date(),
        monthly_rate: "0",
        remarks: "",
    });

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBooking((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const showField = (field: string) => {
        const config = formConfig[booking.booking_status as keyof typeof formConfig];
        if (!config) {
            return ['srp', 'status', 'client', 'ae', 'start', 'end', 'monthly_rate', 'remarks'].includes(field);
        }
        return config.includes(field)
    }

    const salesUnits = useMemo<List[]>(() => {
        if (!users || isUsersLoading || !user) return [];
        const sales = users
            .filter(
                (item) =>
                    item.company?.ID === user.company?.ID && item.sales_unit !== null
            )
            ?.map((user) => {
                return {
                    id: String(user.ID),
                    value: capitalize(`${user.first_name} ${user.last_name}`),
                    label: capitalize(`${user.first_name} ${user.last_name}`),
                };
            });

        return [...sales, { id: v4(), value: "Other (JV Partner)", label: "Other (JV Partner)" }, { id: v4(), value: "Others (In-house account)", label: "Others (In-house account)" }]
    }, [users, isUsersLoading, user]);


    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSend(true)
        const previousBooking = getLatestBooking(site.bookings);
        let AEs = booking.account_executive;

        if (previousBooking) {
            AEs = salesUnits.filter(sales => previousBooking.account_executive.split(",").some(ae => ae.trim() === sales.label));

        }
        createBooking(
            {
                ...booking,
                account_executive: booking.booking_status === "PRE-TERMINATION" ? AEs : booking.account_executive,
                site_rental: String(site.site_rental ?? 0),
                old_client: site.product ? `${site.client}(${site.product})` : site.client,
            },
            {
                onSuccess: async (data, variables) => {
                    if (data?.acknowledged) {

                        // if (import.meta.env.MODE === "development") {

                        let body = `Site ${site.site_code} has a new booking.`;

                        if (variables.booking_status === "CANCELLED") {
                            body = `Site ${site.site_code}'s booking has been cancelled.`
                        } else if (variables.booking_status === "QUEUEING") {
                            body = `A reservation for site ${site.site_code} has been made.`
                        } else if (variables.booking_status === "RENEWAL") {
                            body = `Site ${site.site_code}'s booking has been renewed.`
                        } else if (variables.booking_status === "PRE-TERMINATION") {
                            body = `Site ${site.site_code} has been pre-terminated.`;
                        }

                        if (import.meta.env.MODE === "development") {
                            body = `IT TESTING: ${body}`;
                        }

                        const response = await notifyBooking(body, data.id!);
                        if (response) {
                            toast({
                                variant: "success",
                                title: "Booking created!",
                                description: "Successfully created a booking!",
                            });
                        }
                        // }
                    } else {
                        toast({
                            variant: "success",
                            title: "Booking created!",
                            description: "Successfully created a booking!",
                        });
                    }
                    onSend(false);
                    setOpenBooking(false);
                },
            }
        );
    };

    const notifyBooking = async (body: string, id: number) => {
        if (!users) return;
        const notification: Notification = {
            title: "Site Bookings Alert!",
            recipients: [...salesUnits.map(u => Number(u.id)), ...users.filter(user => user.role.role_id === 13).map(user => Number(user.ID)), 1],
            body: body,
            tag: "booking",
            data: {
                url: `/booking?t=bookings&b=${id}`,
            },
        }

        return await sendNotification(notification);
    }

    const canSubmit = useMemo(() => {
        if (booking.booking_status === "PRE-TERMINATION") {
            return booking.remarks.trim().length > 0
        }
        if (booking.booking_status === "CHANGE OF CONTRACT PERIOD/DURATION") {
            return booking.remarks.trim().length > 0 && differenceInDays(booking.end, booking.start) > 1
        }
        return booking.client.length > 0 && booking.account_executive.length > 0 && differenceInDays(booking.end, booking.start) > 1;
    }, [booking])

    useEffect(() => {
        const statusesStartsFromEndDate = ["NEW", "RENEWAL", "QUEUEING", "SPECIAL EXECUTION"];
        if (statusesStartsFromEndDate.includes(booking.booking_status)) {
            setBooking(prev => {
                if (!prev) return prev;

                return {
                    ...prev,
                    start: prev.end,
                }
            })
        } else {
            setBooking(prev => {
                if (!prev) return prev;

                return {
                    ...prev,
                    start: new Date(site.date_from ?? new Date()),
                }
            })
        }

    }, [site, booking.booking_status])

    useEffect(() => {
        if (!openBooking) {
            setBooking({
                srp: site.price,
                booking_status: (site?.remaining_days ?? 0) > 60 ? "RENEWAL" : "NEW",
                client: (site?.remaining_days ?? 0) > 60 ? `${site.client} ${site.product ? `(${site.product})` : ``}` : "",
                account_executive: [] as List[],
                start: site.end_date ? addDays(new Date(site.end_date), 1) : new Date(),
                end: site.end_date ? addDays(new Date(site.end_date), 1) : new Date(),
                monthly_rate: "0",
                remarks: "",
            })
        }
    }, [openBooking, site.client, site.date_from, site.end_date, site.price, site.product, site?.remaining_days])
    return (
        <Dialog open={openBooking} onOpenChange={setOpenBooking} modal={false}>
            <Tooltip>
                <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button className='p-1.5 h-auto bg-teal-400 hover:bg-teal-600 text-white hover:text-white' variant="ghost" size="sm">
                            <Tag />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>Book</TooltipContent>
            </Tooltip>
            {openBooking && <div onClick={() => setOpenBooking(false)} className='fixed inset-0 pointer-events-all bg-black/20 z-30' />}
            <DialogContent className='gap-2'
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{`Book ${site.site_code}`}</DialogTitle>
                    <DialogDescription>Create or update the booking for this site.</DialogDescription>
                </DialogHeader>
                <form className='space-y-1' onSubmit={onSubmit}>
                    {showField('srp') &&
                        <div>
                            <Label htmlFor='srp' className='text-xs'>SRP</Label>
                            <InputNumber id="srp"
                                value={booking.srp}
                                required
                                onChange={onChange}
                                disabled={send}
                            />
                        </div>}
                    <div>
                        <Label htmlFor='status' className='text-xs'>Booking Status</Label>
                        <Select value={booking.booking_status} disabled={send} onValueChange={(value) =>
                            setBooking((prev) => ({
                                ...prev,
                                booking_status: value,
                                client: value === "RENEWAL" ? `${site.client}` : prev.client,
                            }))
                        }>
                            <SelectTrigger >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(site.remaining_days && site.remaining_days > 60
                                    ? ["RENEWAL", "QUEUEING", "PRE-TERMINATION", "CHANGE OF CONTRACT PERIOD/DURATION"]
                                    : [
                                        "NEW",
                                        "RENEWAL",
                                        "QUEUEING",
                                        "RELOCATION",
                                        "PRE-TERMINATION",
                                        "SPECIAL EXECUTION",
                                        "CHANGE OF CONTRACT PERIOD/DURATION",
                                    ]
                                ).map((opt) => (
                                    <SelectItem className="hover:bg-slate-50" value={opt} key={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {showField("client") &&
                        <div>
                            <Label htmlFor="client" className='text-xs'>Client</Label>
                            <Input
                                id="client"
                                value={booking.client}
                                required
                                onChange={onChange}
                                disabled={send}
                            />
                        </div>
                    }
                    {showField('ae') &&
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
                    }
                    <div>
                        <Label className="mr-auto text-xs">{booking.booking_status === "PRE-TERMINATION" ? "Effectivity Date" : "Duration"}</Label>
                        <div className="flex justify-evenly items-center gap-4">
                            {showField("start") &&
                                <>
                                    <DatePicker
                                        disabled={send}
                                        date={booking.start}
                                        min={new Date(site.date_from ?? booking.start)}
                                        onDateChange={(value) => {
                                            if (!value) return;
                                            setBooking((prev) => ({
                                                ...prev,
                                                start: value,
                                                end: value > prev.end ? value : prev.end,
                                            }));
                                        }}
                                    />
                                    <span>to</span>
                                </>}
                            {showField("end") &&
                                <DatePicker
                                    disabled={send}
                                    date={booking.end}
                                    min={booking.start}
                                    onDateChange={(value) => {
                                        if (!value) return;
                                        setBooking((prev) => ({
                                            ...prev,
                                            end: value,
                                        }));
                                    }}
                                />
                            }
                        </div>
                    </div>
                    {showField("monthly_rate") &&
                        <div>
                            <Label htmlFor='monthly_rate' className='text-xs'>Monthly Rate</Label>
                            <InputNumber id="monthly_rate"
                                value={booking.monthly_rate}
                                required
                                onChange={onChange}
                                disabled={send}
                            />
                        </div>
                    }
                    {showField("remarks") &&
                        <div>
                            <Label htmlFor="remarks" className='text-xs'>Remarks</Label>
                            <Textarea id="remarks"
                                disabled={send}
                                value={booking.remarks}
                                required
                                onChange={(e) =>
                                    setBooking((prev) => ({
                                        ...prev,
                                        [e.target.id]: e.target.value,
                                    }))}
                            />
                        </div>
                    }
                    <DialogFooter className='pt-2'>
                        <Button
                            disabled={send}
                            type="reset"
                            variant="ghost"
                            onClick={() => setOpenBooking(false)}
                        >
                            Cancel
                        </Button>
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
    )
}


export default CreateBooking