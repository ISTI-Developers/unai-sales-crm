import { addYears, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateBefore } from "react-day-picker";
export function DatePicker({
  date,
  onDateChange,
  disabled,
  min,
}: {
  date: Date;
  onDateChange: (value: Date | undefined) => void;
  disabled?: boolean;
  min?: Date;
}) {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          disabled={
            {
              before: min,
            } as DateBefore
          }
          startMonth={min}
          defaultMonth={date}
          endMonth={addYears(new Date(), 5)}
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => onDateChange(date)}
        />
      </PopoverContent>
    </Popover>
  );
}
