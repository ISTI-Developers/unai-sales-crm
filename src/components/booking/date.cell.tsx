import { BookingTable } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { DatePicker } from "../ui/datepicker";
import { Textarea } from "../ui/textarea";
import { useOverrideContractEndDate } from "@/hooks/useSites";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Booking } from "@/hooks/useBookings";

const DateCell = ({ row }: CellContext<BookingTable, unknown>) => {
  const { mutate } = useOverrideContractEndDate();

  const endDate: string = row.getValue("end_date");
  const adjustment = row.original.adjusted_end_date;
  const bookings: Booking[] = row.original.bookings;

  const [data, setData] = useState({
    date: new Date(),
    reason: row.original.adjustment_reason ?? "",
  });
  const [toggle, onToggle] = useState(false);

  const onContinue = async () => {
    mutate(
      {
        reason: data.reason,
        date: format(data.date, "yyyy-MM-dd"),
        site_code: row.original.site,
        end_date: endDate,
        brand: row.original.product ?? "",
      },
      {
        onSuccess: () => {
          onToggle(false);
        },
      }
    );
  };

  const originalBookingDate = useMemo(() => {
    if (!endDate) return undefined;
    const ongoingBookings = bookings.filter(
      (booking) => new Date(booking.date_from) <= new Date() && booking.booking_status !== "CANCELLED"
    );

    const activeBooking = ongoingBookings.find(booking => booking.booking_status !== "QUEUEING");

    if (activeBooking) {
      return new Date(activeBooking.date_to)
    }

    return new Date(endDate);
  }, [bookings, endDate])

  const initialDate = useMemo(() => {
    if (!originalBookingDate) return undefined;

    if (adjustment) {
      if (originalBookingDate > new Date(adjustment)) {
        return originalBookingDate;
      }
      return new Date(adjustment)
    }

    return new Date(originalBookingDate);
  }, [adjustment, originalBookingDate]);

  return (
    <div className="relative group text-[0.6rem] whitespace-nowrap pr-4 transition-all">
      <p className={cn(adjustment ? "text-emerald-500/50 font-semibold" : "")}>
        {initialDate ? format(initialDate, "PP") : "---"}
      </p>
      {(adjustment || initialDate) && (
        <Tooltip delayDuration={0}>
          <Dialog open={toggle} onOpenChange={(open) => {
            setData(prev => {
              return { ...prev, date: initialDate ?? new Date() }
            })
            onToggle(open)
          }}>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-transparent w-full justify-end"
                  )}
                >
                  <PenLine size={5} />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            {adjustment && (
              <TooltipContent className="max-w-[300px] text-wrap">
                <span>
                  {row.original.adjustment_reason}
                </span>
              </TooltipContent>
            )}
            {initialDate &&
              <DialogContent>
                <DialogHeader aria-describedby={undefined}>
                  <DialogTitle>Override for {row.original.site}</DialogTitle>
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="w-1/2">
                      <Label>Original Booking End Date: </Label>
                      <p className="text-sm">
                        {originalBookingDate ? format(originalBookingDate, "PPP") : "---"}
                      </p>
                    </div>
                    <div className="w-1/2">
                      <Label>Adjusted End Date: </Label>
                      <DatePicker
                        date={data.date}
                        min={originalBookingDate}
                        onDateChange={(date) =>
                          setData((prev) => {
                            return {
                              ...prev,
                              date: date ?? new Date(),
                            };
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Adjustment Reason: </Label>
                    <Textarea
                      placeholder="Enter reason here."
                      value={data.reason}
                      onChange={(e) =>
                        setData((prev) => {
                          return { ...prev, reason: e.target.value };
                        })
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="reset"
                      variant="ghost"
                      onClick={() => onToggle(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      disabled={
                        endDate
                          ? format(new Date(endDate), "PPP") ===
                          format(data.date, "PPP") && data.reason === ""
                          : false
                      }
                      onClick={onContinue}
                      className={
                        "bg-main-100 hover:bg-main-700 text-white hover:text-white"
                      }
                    >
                      Continue
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            }
          </Dialog>
        </Tooltip>
      )}
    </div>
  );
};

export default DateCell;
