import { BookingTable } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { differenceInDays } from "date-fns";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
export const AddressCell = ({ row }: CellContext<BookingTable, unknown>) => {
  const item = row.original;

  let remainingDays = item.remaining_days;
  if (item.adjusted_end_date) {
    remainingDays = differenceInDays(
      new Date(item.adjusted_end_date),
      new Date()
    );
  }
  return (
    <div className="text-left space-y-1">
      <div className="flex gap-1 items-center">
        <p className="text-xs font-semibold">{item.structure}</p>
        <Badge
          className={cn(
            "text-[0.6rem] p-0 h-auto px-1.5 uppercase",
            !remainingDays || remainingDays <= 60
              ? "bg-red-100/50 text-red-500 border-red-500"
              : "bg-cyan-100 text-cyan-800 border-cyan-500"
          )}
          variant="outline"
        >
          {!remainingDays || remainingDays <= 60 ? "Available" : "Booked"}
        </Badge>
      </div>

      <p className="uppercase text-[0.6rem] leading-tight italic flex flex-col">
        <span>{item.address}</span>
        <span>{item.facing}</span>
      </p>
    </div>
  );
};
