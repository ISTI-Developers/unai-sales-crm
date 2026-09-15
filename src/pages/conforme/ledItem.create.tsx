import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import InputNumber from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Cart, LEDSiteRow } from "@/interfaces/requests.interface";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addDays, differenceInCalendarDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsUp, Trash2Icon, TrendingDown, TrendingUp } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

interface SiteItemProps {
    item: LEDSiteRow;
    index: number;
    cart: Cart;
    setCart: Dispatch<SetStateAction<Cart>>;
}
function LEDItem({ item, setCart, index }: SiteItemProps) {
    const [showBreakdown, setShowBreakdown] = useState(true)
    const removeSite = (index: number) => {
        setCart(prev => ({
            ...prev,
            leds: prev.leds.filter((_, i) => i !== index),
        }));
    };
    const daysDifference = useMemo(() => differenceInCalendarDays(addDays(item.date.to, 1), item.date.from), [item.date]);
    const packageRate = Number(item.package_rate);

    const spotsRate = Number(item.spots_rate);
    let spotsCount = item.spots_count;

    if (packageRate > 0) {
        spotsCount = packageRate / daysDifference / (spotsRate > 0 ? spotsRate : Number(item.srp));
    }

    spotsCount = Math.floor(spotsCount)
    let srpTotal = Number(item.srp) * daysDifference * spotsCount;

    let contractAmount = spotsCount * spotsRate * daysDifference;
    // srpTotal = packageRate > 0 && item.is_free ? packageRate : (!item.is_free ? Number(item.srp) : spotsRate) * daysDifference * spotsCount;

    if (item.is_free) {
        contractAmount = 0;
        srpTotal = spotsRate * daysDifference * spotsCount

    }

    // const totalNetAmount = item.package_rate === "0" ? Number(item.package_rate) * daysDifference * item.spots_count : Number(item.package_rate);
    const margin = contractAmount - srpTotal;


    return (
        <div className="flex flex-col gap-2 group">
            <header className='relative border-b p-3'>
                <div
                    className='flex gap-8 items-start rounded-md justify-between w-full sm:max-w-fit'>
                    <div>
                        <p className='font-semibold text-sm space-x-2'><span>{item.site.site_code}</span><span className='text-xs'>{item.site.size}</span></p>
                        <p className='text-[0.6rem] leading-tight'>{item.site.address}</p>
                        <p className='text-[0.65rem] leading-tight'>{item.site.board_facing}</p>
                    </div>
                </div>
                <div className='absolute top-2 right-2'>
                    <Button variant="ghost" size="icon" onClick={() => removeSite(index)} ><Trash2Icon /></Button>
                </div>
            </header>
            <main
                className=" grid items-start gap-4 p-3 pt-0 grid-cols-1 "
            >
                <div className="space-y-2">
                    <Label className="text-xs font-medium ">
                        Campaign Period
                    </Label>
                    <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                            <DatePicker
                                date={item.date.from}
                                min={new Date()}
                                className="w-full text-xs"
                                withIcon={false}
                                onDateChange={(value) => {
                                    if (!value) value = new Date();

                                    setCart((prev) => ({
                                        ...prev,
                                        leds: prev.leds.map((row, i) =>
                                            i === index
                                                ? {
                                                    ...row,
                                                    date: {
                                                        from: value,
                                                        to:
                                                            row.date.to > value
                                                                ? row.date.to
                                                                : value,
                                                    },
                                                }
                                                : row
                                        ),
                                    }));
                                }}
                            />
                        </div>
                        <span className='text-xs'>to</span>
                        <div className="min-w-0 flex-1">
                            <DatePicker
                                date={item.date.to}
                                min={item.date.from}
                                className="w-full text-xs"
                                withIcon={false}
                                onDateChange={(value) => {
                                    if (!value) value = new Date();

                                    setCart((prev) => ({
                                        ...prev,
                                        leds: prev.leds.map((row, i) =>
                                            i === index
                                                ? {
                                                    ...row,
                                                    date: {
                                                        ...row.date,
                                                        to: value,
                                                    },
                                                }
                                                : row
                                        ),
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                        <span className="">
                            Duration
                        </span>

                        <span className="font-medium">
                            {daysDifference} day/s
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium ">
                            Offered Monthly Spots
                        </Label>

                        <InputNumber
                            disabled={packageRate > 0}
                            value={packageRate > 0 ? spotsCount : item.spots_count}
                            isMoney={false}
                            groupClassName="w-full"
                            max={item.site.spots_count ?? 0}
                            onChange={(e) => {
                                setCart((prev) => ({
                                    ...prev,
                                    leds: prev.leds.map((row, i) =>
                                        i === index
                                            ? {
                                                ...row,
                                                spots_count: Number(e.target.value),
                                            }
                                            : row
                                    ),
                                }));
                            }}
                        />

                        <div className="flex items-center gap-1 text-[11px]">
                            <span className="">
                                Maximum Spots:
                            </span>
                            <span className="font-medium ">
                                {item.site.spots_count}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium ">
                                Spots Rate
                            </Label>
                            <div className="flex items-center gap-4">
                                <Label>Free</Label>
                                <Switch checked={item.is_free} onCheckedChange={(checked) => setCart((prev) => ({
                                    ...prev,
                                    leds: prev.leds.map((row, i) => i === index ?
                                        {
                                            ...row,
                                            is_free: !!checked
                                        } : row)

                                }))} />
                            </div>
                        </div>

                        <InputNumber
                            value={item.spots_rate}
                            groupClassName="w-full"
                            onChange={(e) => {
                                setCart((prev) => ({
                                    ...prev,
                                    leds: prev.leds.map((row, i) =>
                                        i === index
                                            ? {
                                                ...row,
                                                spots_rate: e.target.value,
                                            }
                                            : row
                                    ),
                                }));
                            }}
                        />

                        <div className="flex items-center gap-1 text-[11px]">
                            <span className="">
                                Floor Rate:
                            </span>
                            <span className="font-medium ">
                                {`${formatAmount(item.site.price)}`}
                            </span>
                            <span className="">
                                SRP:
                            </span>
                            <span className="font-medium ">
                                {`${formatAmount(item.srp)}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div className="space-y-2 w-full">
                        <Label className="text-xs font-medium ">
                            Total Contract Budget/Rate
                        </Label>
                        <InputNumber
                            value={item.package_rate}
                            disabled={item.spots_count !== 0}
                            groupClassName="w-full"
                            onChange={(e) => {
                                setCart((prev) => ({
                                    ...prev,
                                    leds: prev.leds.map((row, i) =>
                                        i === index
                                            ? {
                                                ...row,
                                                package_rate: e.target.value,
                                            }
                                            : row
                                    ),
                                }));
                            }}
                        />
                        <div className="flex items-center gap-1 text-[11px]">
                            <span className="">
                                SRP per SPOT:
                            </span>
                            <span className="font-medium ">
                                {`${formatAmount(Number(item.srp) * daysDifference)}`}
                            </span>
                            <span className="text-[0.6rem]">
                                (SPOTS RATE) x DURATION
                            </span>
                        </div>
                    </div>
                    {/* <div className="space-y-2 w-full">
                        <Label className="text-xs font-medium ">
                            Offered Contract Rate (for rate card display only)
                        </Label>

                        <InputNumber
                            value={item.offered_rate}
                            groupClassName="w-full"
                            onChange={(e) => {
                                setCart((prev) => ({
                                    ...prev,
                                    leds: prev.leds.map((row, i) =>
                                        i === index
                                            ? {
                                                ...row,
                                                offered_rate: e.target.value,
                                            }
                                            : row
                                    ),
                                }));
                            }}
                        />
                    </div> */}
                </div>
                <div className="rounded-lg border p-3 relative bg-white">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" onClick={() => setShowBreakdown(prev => !prev)} className="absolute h-5 -top-3 left-1/2 -translate-x-1/2" variant="outline" size="icon">
                                <ChevronsUp className={cn("transition-all ", showBreakdown ? "rotate-180" : "rotate-0")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{!showBreakdown ? "Show" : "Hide"} Breakdown</TooltipContent>
                    </Tooltip>
                    <AnimatePresence initial={false}>
                        {showBreakdown && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>
                                            SRP Total
                                            <span className="ml-1 text-muted-foreground">
                                                ({daysDifference} days)
                                            </span>
                                        </span>

                                        <span>
                                            {formatAmount(srpTotal)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span>
                                            Given Rate
                                            <span className="ml-1 text-muted-foreground">
                                                ({daysDifference} days)
                                            </span>
                                        </span>

                                        <span>
                                            {formatAmount(contractAmount)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={cn("transition-all", showBreakdown ? "my-3 border-t" : "")} />
                    <div className='flex justify-between items-center'>
                        <p className="text-xs ">
                            LED Package Value
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-xl font-semibold tracking-tight">
                                {formatAmount(contractAmount)}
                            </p>
                            {contractAmount === 0 && <Badge className='bg-sky-100 text-sky-600 border-sky-400 mb-1'>FREE</Badge>}
                        </div>

                    </div>

                    <div className='flex justify-between items-center'>
                        <p className="text-xs ">
                            Margin
                        </p>

                        <Badge
                            variant="secondary"
                            className={cn(
                                "mt-1 gap-1 font-medium",
                                margin >= 0
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                        >
                            {margin >= 0 ? (
                                <TrendingUp size={13} />
                            ) : (
                                <TrendingDown size={13} />
                            )}
                            {formatAmount(margin)}
                        </Badge>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default LEDItem