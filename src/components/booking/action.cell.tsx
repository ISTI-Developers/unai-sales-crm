import { BookingTable } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { FileText, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ReactNode, useMemo, useState, lazy, Suspense } from "react";
import { differenceInDays } from "date-fns";
import { Dialog, DialogTrigger } from "../ui/dialog";

const CreateBookingDialog = lazy(
  () => import("@/components/booking/book.dialog")
);
const ViewBookingDialog = lazy(
  () => import("@/components/booking/view.dialog")
);

export const ActionCell = (cell: CellContext<BookingTable, unknown>) => {
  const item = cell.row.original;
  const [openBooking, setOpenBooking] = useState(false);
  const [openViewing, setOpenViewing] = useState(false);

  const remainingDays = useMemo(() => {
    let days = item.remaining_days;
    if (item.adjusted_end_date) {
      days = differenceInDays(new Date(item.adjusted_end_date), new Date());
    }
    return days;
  }, [item]);

  return (
    <div className="flex items-center justify-center gap-2">
      <Dialog open={openBooking} onOpenChange={setOpenBooking}>
        <ActionButton action="book">
          <Tag size={14} />
        </ActionButton>
        {openBooking && (
          <Suspense fallback={<></>}>
            <CreateBookingDialog
              site={item}
              remainingDays={remainingDays}
              onOpenChange={setOpenBooking}
            />
          </Suspense>
        )}
      </Dialog>
      <Dialog open={openViewing} onOpenChange={setOpenViewing}>
        <ActionButton
          hasBookings={cell.row.original.bookings.length > 0}
          action="view"
        >
          <FileText size={14} />
        </ActionButton>
        {openViewing && (
          <Suspense fallback={<></>}>
            <ViewBookingDialog site={item} />
          </Suspense>
        )}
      </Dialog>
    </div>
  );
};

const ActionButton = ({
  hasBookings = false,
  action,
  children,
}: {
  hasBookings?: boolean;
  action: "book" | "view";
  children: ReactNode;
}) => {
  const base = "p-1.5 h-auto";

  const isDisabled = useMemo(() => {
    return action === "view" ? !hasBookings : false;
  }, [action, hasBookings]);
  return (
    <Tooltip>
      <DialogTrigger asChild>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              base,
              "text-white disabled:bg-slate-200 hover:text-white",
              action === "book"
                ? "bg-teal-400 hover:bg-teal-500"
                : "bg-yellow-400 hover:bg-yellow-600"
            )}
            disabled={isDisabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
      </DialogTrigger>
      {action === "book" ? (
        <TooltipContent>{isDisabled ? "Unavailable" : "Book"}</TooltipContent>
      ) : (
        <TooltipContent>
          {isDisabled ? "Booked from UNIS" : "View"}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
