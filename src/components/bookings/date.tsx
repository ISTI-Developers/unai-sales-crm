import { SiteAvailability } from "@/interfaces/sites.interface"
import { CellContext } from "@tanstack/react-table"
import { format } from "date-fns";

import { useOverrideContractEndDate, useOverridenSiteEndDates } from "@/hooks/useSites";
import { useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Calendar, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { DatePicker } from "../ui/datepicker";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

function DateCell({ row }: CellContext<SiteAvailability, unknown>) {
    const site = row.original;
    const siteCode = site.site_code;
    const originalEndDate = site.end_date;

    const { data, isLoading } = useOverridenSiteEndDates();
    const { mutate: overrideDate } = useOverrideContractEndDate();
    const [open, setOpen] = useState(false);

    const onContinue = () => {
        overrideDate(
            {
                reason: adjustment.reason!,
                date: format(adjustment.date, "yyyy-MM-dd"),
                site_code: row.original.site,
                end_date: originalEndDate!,
                brand: row.original.product ?? "",
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            }
        );
    };
    const adjustedDate = useMemo(() => {
        if (!data || isLoading || !site.date_from) return;

        const adjustment = data.find(d => d.site_code === siteCode);
        if (adjustment) {
            if (new Date(site.date_from) < new Date(adjustment.adjusted_end_date)) {
                return adjustment.adjusted_end_date;
            }
            return;

        }
    }, [data, isLoading, site.date_from, siteCode])

    const [adjustment, setAdjustment] = useState({
        date: new Date(adjustedDate ?? (originalEndDate ?? new Date())),
        reason: site.adjustment_reason,
    })
    const canOverride = (site.remaining_days ?? 0) > 0 && originalEndDate && !['CANCELLED', 'PRE-TERMINATION'].includes(site.booking_status ?? "");

    return (
        <div className="relative group text-[.6rem] text-start px-2 whitespace-nowrap">
            <p className={cn(adjustedDate ? "text-emerald-500/50 font-semibold" : "")}>
                {originalEndDate ? format(new Date(originalEndDate), "PPP") : "---"}
            </p>
            {canOverride &&
                <Tooltip>
                    <Dialog open={open} onOpenChange={(open) => {
                        setAdjustment({
                            date: new Date(adjustedDate ?? (originalEndDate ?? new Date())),
                            reason: site.adjustment_reason,
                        })
                        setOpen(open)
                    }}>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-transparent w-full flex justify-end">
                                    <PenLine size={12} />
                                </button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        {adjustedDate && <TooltipContent className="max-w-[300px] text-wrap">
                            {adjustment.reason}
                        </TooltipContent>}

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Contract Override</DialogTitle>
                                <DialogDescription>Extend the end date of the current contract of {siteCode}</DialogDescription>
                            </DialogHeader>
                            <form className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs">Original End Date</Label>
                                        <div className="flex items-center gap-4 p-2 pl-0 text-sm whitespace-nowrap">
                                            <Calendar size={16} />
                                            <p>{format(new Date(originalEndDate), "PPP")}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Adjusted End Date</Label>
                                        <DatePicker date={adjustment.date} onDateChange={(date) => setAdjustment((prev) => ({
                                            ...prev,
                                            date: date!
                                        }))} />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs">Reason for Adjustment</Label>
                                    <Textarea value={adjustment.reason} onChange={(e) => setAdjustment(prev => ({
                                        ...prev,
                                        reason: e.target.value
                                    }))} />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="reset"
                                        variant="ghost"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        disabled={
                                            format(new Date(originalEndDate), "PPP") ===
                                            format(adjustment.date, "PPP") && adjustment.reason === ""

                                        }
                                        onClick={onContinue}
                                        className={
                                            "bg-main-100 hover:bg-main-700 text-white hover:text-white"
                                        }
                                    >
                                        Continue
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </Tooltip>}

        </div>
    )
}

export default DateCell