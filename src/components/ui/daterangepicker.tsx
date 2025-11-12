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
import { DateBefore, DateRange } from "react-day-picker";
import { useState } from "react";
export function DateRangePicker({
    date,
    onDateChange,
    disabled,
    min,
}: {
    date?: DateRange;
    onDateChange: (value: DateRange | undefined) => void;
    disabled?: boolean;
    min?: Date;
}) {
    const [month, setMonth] = useState<Date>()
    return (
        <Popover modal>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "justify-start text-left font-normal h-7 px-2",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="range"
                    disabled={
                        {
                            before: min,
                        } as DateBefore
                    }
                    startMonth={min}
                    month={month} // ✅ use `month` instead of `defaultMonth`
                    onMonthChange={setMonth} // ✅ keep month in sync when user changes it
                    endMonth={addYears(new Date(), 5)}
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={onDateChange}
                />
                <footer className="grid grid-cols-2 gap-4 p-4 pt-0">
                    <Button variant="outline" onClick={() => setMonth(new Date())}>Today</Button>
                    <Button variant="outline" className="text-red-300" onClick={() => onDateChange(undefined)}>Clear</Button>
                </footer>
            </PopoverContent>
        </Popover>
    );
}
