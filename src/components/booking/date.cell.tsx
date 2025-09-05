import { BookingTable } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
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

  const item: string = row.getValue("end_date");
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
        end_date: item,
        brand: row.original.product ?? "",
      },
      {
        onSuccess: () => {
          onToggle(false);
        },
      }
    );
  };

  const initialDate = useMemo(() => {
    if (!item && bookings.length === 0) return null;

    if (bookings.length > 0) {
      const activeBooking = bookings.find(
        (booking) =>
          new Date(booking.date_from) <= new Date() &&
          booking.booking_status !== "CANCELLED"
      );
      if (activeBooking) {
        return new Date(activeBooking.date_to);
      }
    }
    
    if (!item) return null;

    return new Date(item);
  }, [bookings, item]);

  useEffect(() => {
    if (!initialDate) return;
    setData((prev) => {
      return {
        ...prev,
        date: adjustment ? new Date(adjustment) : initialDate,
      };
    });
  }, [adjustment, initialDate]);
  return (
    <div className="relative group text-[0.65rem] whitespace-nowrap pr-4 transition-all">
      <p className={cn(adjustment ? "text-emerald-500/50 font-semibold" : "")}>
        {adjustment
          ? format(adjustment, "PP")
          : initialDate
          ? format(initialDate, "PP")
          : "---"}
      </p>
      {(adjustment || initialDate) && (
        <Tooltip delayDuration={0}>
          <Dialog open={toggle} onOpenChange={onToggle}>
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
              <TooltipContent className="bg-main-100/30 backdrop-blur-sm border-2 border-white/10 p-2 rounded">
                <span className="mix-blend-color-dodge text-white font-semibold">
                  {row.original.adjustment_reason}
                </span>
              </TooltipContent>
            )}
            <DialogContent>
              <DialogHeader aria-describedby={undefined}>
                <DialogTitle>Override for {row.original.site}</DialogTitle>
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="w-1/2">
                    <Label>Original Date: </Label>
                    <p className="text-sm">
                      {initialDate ? format(initialDate, "PPP") : "---"}
                    </p>
                  </div>
                  <div className="w-1/2">
                    <Label>Adjusted Date: </Label>
                    <DatePicker
                      date={data.date}
                      min={initialDate ? new Date(initialDate) : data.date}
                      onDateChange={(date) =>
                        setData((prev) => {
                          console.log(date);
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
                      item
                        ? format(new Date(item), "PPP") ===
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
          </Dialog>
        </Tooltip>
      )}
    </div>
  );
};

export default DateCell;
