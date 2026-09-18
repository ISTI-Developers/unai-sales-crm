import { Badge } from "@/components/ui/badge";
import { LEDBoards } from "@/data/LEDBoards";
import { LEDSite } from "@/interfaces/requests.interface";
import { formatAmount, formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addDays, differenceInCalendarDays } from "date-fns";

export const ConformeLEDDetails = ({ cartLED }: { cartLED: LEDSite }) => {
    const led = LEDBoards.find(item => item.ID === cartLED.ID);
    if (!led) {
        return <>Loading...</>
    }
    const duration = Math.round(Math.max(differenceInCalendarDays(addDays(cartLED.to, 1), cartLED.from), 0) / 30) * 30;

    const spotsRate = cartLED.srp
    const srp = led.spots_price;
    let spotsCount = cartLED.spots_count;
    if (cartLED.package_rate > 0) {
        spotsCount = cartLED.package_rate / duration / spotsRate;
        spotsCount = Math.ceil(spotsCount)
    }
    let grandTotal = spotsCount * spotsRate * duration;
    let totalSRP = srp * duration * spotsCount;
    if (cartLED.is_free) {
        grandTotal = 0;
        totalSRP = spotsRate * duration * spotsCount;
    }
    const margin = grandTotal - totalSRP;

    return <div className="grid gap-2 p-4 border rounded-xl">
        <header className="grid grid-cols-2 gap-2">
            <div>
                <div className="flex gap-1 items-center">
                    <p className="font-semibold leading-tight">{led.site_code}</p>
                    <p className="text-xs leading-tight">({led.size})</p>
                </div>
                <p className="text-xs text-zinc-500 leading-tight">{led.address}</p>
                <p className="text-[0.65rem] italic text-zinc-400 leading-tight">{led.board_facing}</p>
                <div className="flex items-center gap-1 text-sm font-semibold pt-1">
                    <span>SRP: </span>
                    <span className="leading-tight">{formatAmount(led.spots_price)}/spot</span>
                </div>
            </div>
            <div className="flex flex-col items-end text-sm self-start justify-end">
                <span className="leading-tight font-semibold">{duration} days</span>
                <span className="leading-tight">{formatDateRange(new Date(cartLED.from), new Date(cartLED.to))}</span>
            </div>
        </header>
        <hr />
        <div className="flex justify-between items-start gap-1 text-sm">
            <span className="text-xs font-semibold text-gray-500">
                Offered Rate
            </span>
            <div className="flex items-end flex-col">
                <span className="leading-tight">{formatAmount(cartLED.srp)}/spot</span>
            </div>
        </div>
        <div className="flex justify-between items-start gap-1 text-sm">
            <span className="text-xs font-semibold text-gray-500">
                Offered Spots
            </span>
            <div className="flex items-end flex-col">
                <span className="leading-tight">{spotsCount} spots</span>
            </div>
        </div>
        <hr />
        <div className="flex items-end justify-between">
            <div>
                <span className="text-xs font-semibold">
                    Total Package Value
                </span>
            </div>

            <span className="text-lg font-semibold">
                {cartLED.is_free ? "FREE" : formatAmount(grandTotal)}
            </span>
        </div>

        {/* Variance */}
        <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-gray-500">
                SRP Variance
            </span>

            <Badge
                className={cn(
                    "px-2",
                    margin >= 0
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-200 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                )}
            >
                {margin >= 0 ? "+" : ""}
                {formatAmount(margin)}
            </Badge>
        </div>
    </div>
}