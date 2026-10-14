import ClientBrandCombobox from "@/components/ui/client-brand-combo-box";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputNumber from "@/components/ui/number-input";
import { useClients } from "@/hooks/useClients";
import { getCurrentBooking, useAddBooking } from "@/hooks/v2/useBookings";
import { Availability, BookingForm, TaggedBooking } from "@/interfaces/bookings.interface";
import { Client } from "@/interfaces/client.interface";
import { splitClientName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addDays, addMonths, differenceInDays, format, isToday, subDays } from "date-fns";
import { Loader2, RepeatIcon, TagPlusIcon } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ChangeOfContractForm, ContractRateForm, SalesUnitPicker } from "./components";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
interface BookProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeRow: Availability;
}

const initialBooking: TaggedBooking = {
    srp: 0,
    booking_status: "NEW",
    account_executive: "",
    addendum: "",
    client: "",
    product: "",
    created_at: new Date().toString(),
    date_from: format(new Date(), "yyyy-MM-dd"),
    date_to: format(addMonths(subDays(new Date(), 1), 1), 'yyyy-MM-dd'),
    ID: 0,
    is_prime: 0,
    modified_at: new Date().toString(),
    old_client: "",
    monthly_rate: 0,
    remarks: "",
    site_code: "",
    site_rental: 0,
}
function Book({ open, onOpenChange, activeRow: site }: BookProps) {
    const { mutate: createBooking, isPending } = useAddBooking();
    const { data: clients = [], isLoading } = useClients();
    const [booking, setBooking] = useState<TaggedBooking>(initialBooking)
    const [selectedClient, setClient] = useState<Client>()

    const currentBooking = getCurrentBooking(site.bookings)
    const endDate = currentBooking?.date_to;
    const remainingDays = Math.max(differenceInDays(new Date(endDate ?? new Date()), new Date()), 0);
    const isRenewal = endDate ? remainingDays > 60 : false;
    const { client, product } = splitClientName(currentBooking?.client ?? "");
    const startDate = currentBooking?.booking_status === "PRE-TERMINATION" ? new Date(endDate ?? new Date()) : addDays(new Date(endDate ?? new Date()), 1);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBooking((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const bookingForm: BookingForm = {
            booking_status: booking.booking_status,
            addendum: booking.booking_status === "NEW" && isRenewal ? "QUEUEING" : null,
            account_executive: booking.account_executive,
            client: `${selectedClient?.name} (${selectedClient?.brand})`,
            old_client: currentBooking?.client ?? "N/A",
            date_from: booking.date_from,
            date_to: booking.date_to,
            monthly_rate: booking.monthly_rate,
            remarks: booking.remarks,
            site_code: booking.site_code,
            site_rental: booking.site_rental,
            srp: booking.srp,
            created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
        }
        createBooking(bookingForm, {
            onSuccess: () => {
                onOpenChange(false);
                toast({
                    variant: "success",
                    description: "Booking successfully created."
                })
            }
        })


    }
    useEffect(() => {

        const startDate = addDays(new Date(endDate ?? new Date()), 1);
        setBooking(prev => ({
            ...prev,
            srp: site.srp,
            booking_status: isRenewal ? "RENEWAL" : "NEW",
            account_executive: isRenewal ? currentBooking?.account_executive ?? "" : "",
            client: isRenewal ? client : "",
            product: isRenewal ? product : "",
            date_from: format(startDate, "yyyy-MM-dd"),
            date_to: format(addMonths(subDays(startDate, 1), 1), 'yyyy-MM-dd'),
            site_code: site.site_code,
            site_rental: site.site_rental,
        }))
        if (isRenewal) {
            const cnt = clients.find(c => c.name.toLowerCase().trim() === client.toLowerCase().trim());
            if (cnt) {
                setClient({ ...cnt, brand: product })
            }
        }
    }, [client, clients, currentBooking, endDate, isRenewal, product, site])

    useEffect(() => {
        setBooking(prev => ({
            ...prev,
            account_executive: booking.booking_status === "RENEWAL" ? currentBooking?.account_executive ?? "" : "",
            monthly_rate: booking.booking_status === "RENEWAL" ? currentBooking?.monthly_rate ?? 0 : 0
        }))
    }, [currentBooking, booking.booking_status])

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            {open && <div onClick={() => onOpenChange(false)} className='fixed inset-0 pointer-events-all bg-black/20 z-30' />}
            <DialogContent onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()} className="max-w-xl">
                <DialogHeader className="text-sm">
                    <DialogTitle>{`Book ${site.site_code}`}</DialogTitle>
                    <DialogDescription className="text-xs">{site.address}</DialogDescription>
                </DialogHeader>
                <form className="space-y-2" onSubmit={onSubmit}>
                    <ActionPicker onValueChange={(value) => {
                        setBooking(prev => {
                            const addendum = value === "SPECIAL EXECUTION" ? value : isRenewal ? "QUEUEING" : null;
                            return {
                                ...prev,
                                booking_status: value ?? "NEW",
                                addendum: addendum,
                            }
                        });
                        if (value === "RENEWAL") {
                            const cnt = clients.find(c => c.name.toLowerCase().trim() === client.toLowerCase().trim());
                            if (cnt) {
                                setClient({ ...cnt, brand: product })
                            }
                        } else {
                            setClient(undefined)
                        }
                    }} value={booking.booking_status} />
                    <div>
                        <Label htmlFor='srp' className='text-xs'>SRP</Label>
                        <InputNumber id="srp"
                            groupClassName='h-8'
                            value={booking.srp}
                            required
                            onChange={onChange}
                            disabled={isPending}
                        />
                    </div>
                    {isLoading ? <p>Loading clients. please wait</p> :
                        <>
                            <div>
                                <Label htmlFor="client" className='text-xs'>Client</Label>
                                <ClientBrandCombobox value={selectedClient} onValueChange={setClient} className='h-8' />
                            </div>
                            <div>
                                <Label htmlFor="brand" className='text-xs'>Brand</Label>
                                <Input
                                    id="brand"
                                    value={selectedClient?.brand ?? ""}
                                    required
                                    onChange={(e) => setClient(prev => {
                                        if (!prev) return;

                                        return {
                                            ...prev,
                                            brand: e.target.value
                                        }
                                    })}
                                    disabled={isPending}
                                    className='h-8'
                                />
                            </div>
                        </>
                    }

                    <SalesUnitPicker booking={booking} setBooking={setBooking} />
                    <ChangeOfContractForm booking={booking} setBooking={setBooking} min={startDate} />
                    <ContractRateForm booking={booking} setBooking={setBooking} disabled={!isToday(new Date(booking.created_at))} />
                    <div>
                        <Label>Remarks</Label>
                        <Textarea value={booking.remarks} placeholder="State the reason for this change" onChange={(e) => setBooking(prev => ({
                            ...prev,
                            remarks: e.target.value
                        }))} />
                    </div>
                    <DialogFooter className='pt-2'>
                        <Button
                            disabled={isPending}
                            type="reset"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="ghost"
                            type="submit"
                            disabled={isPending}
                            className={
                                "bg-main-100 hover:bg-main-700 text-white hover:text-white"
                            }
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            Continue
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const ActionPicker = ({ value, onValueChange, disabled }: { value?: string; onValueChange: (value?: string) => void; disabled?: boolean }) => {

    return <section className="grid grid-cols-2 gap-4">
        {["NEW", "RENEWAL"].map(modifier => {
            const Icon = modifier === "RENEWAL" ? RepeatIcon : TagPlusIcon

            return <div key={modifier} role="button" aria-disabled={disabled} onClick={() => onValueChange(modifier)} className={cn("text-[0.65rem] leading-tight text-center border rounded-lg flex flex-col gap-2 justify-center py-2 items-center",
                "hover:bg-zinc-100",
                value === modifier && "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
                "aria-disabled:pointer-events-none aria-disabled:opacity-30"
            )}>
                <Icon className={cn(value === modifier ? " text-emerald-700" : "text-zinc-600")} />
                <p className="font-semibold">{modifier}</p>
            </div>
        })}
    </section>
}

export default Book