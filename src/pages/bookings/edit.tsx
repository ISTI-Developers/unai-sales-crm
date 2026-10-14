import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentBooking, getDisplayStatus, modifiers, useAddBooking, usePreterminateBooking, useUpdateBooking, useUpdateBookingTermDetails } from "@/hooks/v2/useBookings";
import { BookingContext, BookingForm, Modifier, TaggedBooking } from "@/interfaces/bookings.interface"
import { capitalize, cn } from "@/lib/utils";
import { BanIcon, CalendarChevronsRight, Loader2, PencilIcon, RepeatIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DateEffectivityForm, ChangeOfContractForm, SitePicker, ContractRateForm, SalesUnitPicker } from "./components";
import { format } from "date-fns";
import useAvailableSites from "@/hooks/useAvailableSites";
import { toast } from "@/hooks/use-toast";

interface EditProps {
    booking: TaggedBooking;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    context?: BookingContext;
}
function Edit({ open, onOpenChange, booking, context }: EditProps) {
    const { mutate: updateBookingDetails, isPending: isUpdatePending } = useUpdateBooking();
    const { mutate: updateBookingTermDetails, isPending: isChangePending } = useUpdateBookingTermDetails();
    const { mutate: preterminateBooking, isPending: isPreterminatePending } = usePreterminateBooking();
    const { mutate: createBooking, isPending: isCreatePending } = useAddBooking();
    const availableSites = useAvailableSites();
    const isPending = isUpdatePending || isPreterminatePending || isCreatePending || isChangePending;

    const [action, setAction] = useState<Modifier | undefined>("CHANGE OF CONTRACT DETAILS")
    const [data, setData] = useState<TaggedBooking>({
        ...booking,
        remarks: ""
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        switch (action) {
            case "CHANGE OF CONTRACT DETAILS":
                {
                    const updateData = {
                        account_executive: data.account_executive,
                        monthly_rate: data.monthly_rate,
                        remarks: data.remarks
                    }
                    updateBookingDetails({ ID: data.ID, data: updateData }, {
                        onSuccess: () => {
                            onOpenChange(false)
                        }
                    })
                }
                break;
            case "CHANGE OF CONTRACT PERIOD/DURATION":
                {
                    const updateData = {
                        date_from: data.date_from,
                        date_to: data.date_to,
                        booking_status: data.booking_status,
                        addendum: booking.date_from === data.date_from && booking.date_to !== data.date_to ? "CONTRACT EXTENSION" : action,
                        remarks: data.remarks
                    }
                    updateBookingTermDetails({ ID: data.ID, data: updateData }, {
                        onSuccess: () => {
                            onOpenChange(false)
                        }
                    })
                }
                break;
            case "PRE-TERMINATION":
                {
                    const updateData = {
                        date_to: data.effectivity_date,
                        remarks: data.remarks
                    }
                    preterminateBooking({ ID: data.ID, data: updateData }, {
                        onSuccess: () => {
                            onOpenChange(false)
                            toast({
                                description: "Booking has been pre-terminated.",
                                variant: "success",
                            })
                        }
                    })
                }
                break;
            case "RELOCATION":
                {
                    const updateData = {
                        date_to: data.effectivity_date,
                        remarks: `Pretermination effective ${format(new Date(data.effectivity_date!), "PPP")}, will relocate to ${data.site_code}.`,
                    }
                    preterminateBooking({ ID: data.ID, data: updateData }, {
                        onSuccess: () => {
                            const selectedSite = availableSites.find(site => site.site_code === data.site_code);
                            if (!selectedSite) {
                                toast({
                                    variant: "warning",
                                    description: "An error occured while fetching site details."
                                })
                                return;
                            }
                            const currentBooking = getCurrentBooking(selectedSite.bookings);

                            const bookingForm: BookingForm = {
                                booking_status: "NEW",
                                addendum: "RELOCATION",
                                account_executive: data.account_executive,
                                client: data.client,
                                old_client: currentBooking?.client ?? "N/A",
                                date_from: data.date_from,
                                date_to: data.date_to,
                                monthly_rate: data.monthly_rate,
                                remarks: data.remarks,
                                site_code: data.site_code,
                                site_rental: data.site_rental,
                                srp: data.srp,
                                created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
                            }
                            createBooking(bookingForm, {
                                onSuccess: () => {
                                    onOpenChange(false);
                                    toast({
                                        variant: "success",
                                        description: "Booking relocation successful."
                                    })

                                }
                            })
                        }
                    })
                }
                break;
        }
    }
    const canBePreterminated = useMemo(() => {
        if (!context) return false;
        return getDisplayStatus(booking, context) === "RUNNING";
    }, [booking, context])

    useEffect(() => {
        setData(prev => ({ ...prev, remarks: action === "CHANGE OF CONTRACT DETAILS" ? booking.remarks : "" }))
    }, [action, booking.remarks])
    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            {/* {open && <div onClick={() => onOpenChange(false)} className='fixed inset-0 pointer-events-all bg-black/20 z-[51]' />} */}

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-[1rem] leading-none">Manage Booking {action ? `| ${capitalize(action.toLowerCase(), " ")}` : ``}</DialogTitle>
                    <DialogDescription className="text-xs">Modify booking details of <span className="font-semibold">{booking.client}</span></DialogDescription>
                </DialogHeader>
                <form className="space-y-2" onSubmit={onSubmit}>
                    <ActionPicker value={action} onValueChange={setAction} disabled={!canBePreterminated} />
                    <div className="grid gap-4">
                        {action === "PRE-TERMINATION" ? <DateEffectivityForm booking={data} setBooking={setData} /> :
                            action === "CHANGE OF CONTRACT PERIOD/DURATION" ? <ChangeOfContractForm booking={data} setBooking={setData} min={undefined} /> :
                                action === "RELOCATION" ? <>
                                    <DateEffectivityForm booking={data} setBooking={setData} />
                                    <SitePicker booking={data} setBooking={setData} />
                                    <ContractRateForm booking={data} setBooking={setData} />
                                    <ChangeOfContractForm booking={data} setBooking={setData} min={new Date} />
                                </> : <>
                                    <SalesUnitPicker booking={data} setBooking={setData} />
                                    <ContractRateForm booking={data} setBooking={setData} />
                                </>}
                        <div>
                            <Label>Remarks</Label>
                            <Textarea value={data.remarks} placeholder="State the reason for this change" onChange={(e) => setData(prev => ({
                                ...prev,
                                remarks: e.target.value
                            }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            setAction("CHANGE OF CONTRACT DETAILS");
                            onOpenChange(false)
                        }} size="sm" variant="ghost">Cancel</Button>
                        <Button type="submit" disabled={isPending} size="sm">
                            {isPending && <Loader2 className="animate-spin" />}
                            Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
const ActionPicker = ({ value, onValueChange, disabled }: { value?: Modifier; onValueChange: (value?: Modifier) => void; disabled?: boolean }) => {

    return <section className="grid grid-cols-4 gap-4">
        {modifiers.map(modifier => {
            const Icon = modifier === "CHANGE OF CONTRACT PERIOD/DURATION" ? CalendarChevronsRight :
                modifier === "PRE-TERMINATION" ? BanIcon :
                    modifier === "RELOCATION" ? RepeatIcon : PencilIcon

            return <div key={modifier} role="button" aria-disabled={disabled && modifier === "PRE-TERMINATION"} onClick={() => onValueChange(modifier)} className={cn("text-[0.65rem] leading-tight text-center border rounded-lg flex flex-col gap-2 justify-center py-2 items-center",
                "hover:bg-zinc-100",
                value === modifier && "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
                "aria-disabled:pointer-events-none aria-disabled:opacity-30"
            )}>
                <Icon className={cn(value === modifier ? " text-emerald-700" : "text-zinc-700")} />
                <p className="font-semibold">{modifier}</p>
            </div>
        })}
    </section>
}
export default Edit