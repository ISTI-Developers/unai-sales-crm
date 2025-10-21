import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { BookingTable } from "@/interfaces/sites.interface";
import {
  Booking,
  useCancelBooking,
  useUpdateBooking,
} from "@/hooks/useBookings";
import { formatAmount, formatTermDetails } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Ban, Loader2, Pen } from "lucide-react";
import { Button } from "../ui/button";
import { FormEvent, useMemo, useState } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DatePicker } from "../ui/datepicker";
import { Input } from "../ui/input";
import { differenceInDays } from "date-fns";

const ViewBookingDialog = ({ site }: { site: BookingTable }) => {
  const [show, onShow] = useState(false);
  const headers = ["status", "client", "AE", "SRP", "term details", "action"];

  const bookings = useMemo(() => {
    if (!site) return [];

    return site.bookings
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
        return (
          new Date(a.date_from).getTime() - new Date(b.date_from).getTime()
        );
      });
  }, [site, show]);
  return (
    <DialogContent className="max-w-5xl">
      <DialogHeader>
        <DialogTitle>Bookings for {site.site}</DialogTitle>
        <DialogDescription>
          <div className="py-1 flex items-center gap-2">
            <Switch checked={show} onCheckedChange={onShow} />
            <Label>Show cancelled bookings</Label>
          </div>
        </DialogDescription>
      </DialogHeader>
      <div>
        {!site.bookings ? (
          <>Listing bookings...</>
        ) : (
          <>
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
                    <BookingItem item={item} key={`${item.site_code}-${item.ID}`} show={show} />
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </DialogContent>
  );
};

const BookingItem = ({ item, show }: { item: Booking; show: boolean }) => {
  const { mutate: cancelBooking } = useCancelBooking();
  const [open, setOpen] = useState(false);
  const [send, onSend] = useState(false);
  const [reason, setReason] = useState("");
  const termDetails = formatTermDetails(
    item.date_from,
    item.date_to,
    item.monthly_rate
  );

  const ongoingBooking = useMemo(() => {
    return (
      new Date(item.date_from) <= new Date() &&
      new Date(item.date_to) > new Date() &&
      item.booking_status !== "CANCELLED"
    );
  }, [item]);

  const onContinue = async () => {
    onSend(true);
    cancelBooking({ booking_id: item.ID, reason: reason }, {
      onSuccess: () => {
        setOpen(false);
        onSend(false);
      },
    });
  };
  return (
    <TableRow
      className={cn(
        "text-xs",
        show && item.booking_status === "CANCELLED"
          ? "bg-red-50 text-red-300"
          : "",
        ongoingBooking
          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
          : ""
      )}
    >
      <TableCell className="font-semibold">
        <div>
          <p>{item.booking_status}</p>
        </div>
      </TableCell>
      <TableCell>{item.client}</TableCell>
      <TableCell>{item.account_executive}</TableCell>
      <TableCell>{formatAmount(item.srp)}</TableCell>
      <TableCell>{termDetails}</TableCell>
      <TableCell align="center">
        {item.booking_status !== "CANCELLED" && (
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
  const { mutate: updateBooking } = useUpdateBooking();
  const [booking, setBooking] = useState({
    ...item,
    date_from: new Date(item.date_from),
    date_to: new Date(item.date_to)
  })
  const [open, setOpen] = useState(false);
  const [send, onSend] = useState(false);

  const canSubmit = useMemo(() => {
    return booking.client.length > 0 && booking.account_executive.length > 0 && Number(booking.monthly_rate) > 0 && differenceInDays(booking.date_to, booking.date_from) > 1;
  }, [booking])
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSend(true)

    updateBooking(booking, {
      onSuccess: () => {
        onSend(false);
        setOpen(false);
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
        <DialogDescription>For client and account executives changes, it is advisable to re-book the site.</DialogDescription>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1">
          <Label htmlFor="booking_status">Booking Status</Label>
          <Select
            disabled={send}
            value={booking.booking_status}
            onValueChange={(value) =>
              setBooking((prev) => ({
                ...prev,
                booking_status: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select booking status" />
            </SelectTrigger>
            <SelectContent>
              {[
                "NEW",
                "RENEWAL",
                "QUEUEING",
                "RELOCATION",
                "PRE-TERMINATION",
                "SPECIAL EXECUTION",
                "CHANGE OF CONTRACT PERIOD",
              ]
                .map((opt) => (
                  <SelectItem className="hover:bg-slate-50" value={opt} key={opt}>
                    {opt}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="mr-auto">Duration</Label>
          <div className="flex justify-evenly items-center gap-4">
            <DatePicker
              disabled={send}
              date={booking.date_from}
              min={booking.date_from}
              onDateChange={(value) => {
                if (!value) return;
                setBooking((prev) => ({
                  ...prev,
                  date_from: value,
                  date_to: value > prev.date_to ? value : prev.date_to,
                }));
              }}
            />
            <span>to</span>
            <DatePicker
              disabled={send}
              date={booking.date_to}
              min={booking.date_from}
              onDateChange={(value) => {
                if (!value) return;
                setBooking((prev) => ({
                  ...prev,
                  date_to: value,
                }));
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1"><Label htmlFor="monthly_rate">Monthly Rate</Label>
          <Input
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
export default ViewBookingDialog;
