import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Label } from '@/components/ui/label';
import InputNumber from '@/components/ui/number-input';
import { Cart, SiteRow } from '@/interfaces/requests.interface';

import { formatAmount } from '@/lib/format';
import { cn, getAddOnTotal, getCost, getSiteInstallationCost, getSiteMaterial, getTotalGivenRate, getTotalSiteSRP } from '@/lib/utils';
import { Trash2Icon, TrendingDown, TrendingUp, ChevronsUp } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { addDays, differenceInCalendarMonths } from 'date-fns';
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from '@/components/ui/badge';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SiteItemProps {
    item: SiteRow;
    index: number;
    cart: Cart;
    setCart: Dispatch<SetStateAction<Cart>>;
}
function SiteItem({ item, setCart, index }: SiteItemProps) {
    const [showBreakdown, setShowBreakdown] = useState(true)
    const removeSite = (index: number) => {
        setCart(prev => ({
            ...prev,
            sites: prev.sites.filter((_, i) => i !== index),
        }));
    };

    const applyToAll = () => {
        const dates = item.date;

        setCart(prev => ({
            ...prev,
            sites: prev.sites.map(site => ({
                ...site,
                date: dates,
            })),
            leds: prev.leds.map(led => ({
                ...led,
                date: dates
            }))
        }))
    }

    const addOnTotal = getAddOnTotal(item);
    const monthDifference = useMemo(() => differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from), [item.date]);

    const totalNetAmount = getTotalGivenRate(Number(item.package_rate) * monthDifference, item) - addOnTotal;
    const srpTotal = getTotalSiteSRP(item, monthDifference);
    const margin = totalNetAmount - srpTotal;

    return <div className='relative flex flex-col gap-2 group bg-zinc-100'>
        <header className='border-b p-3 bg-zinc-200'>
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
            className=" grid items-start gap-4 p-3 pt-0 grid-cols-1"
        >
            <div className="space-y-2">
                <div className='flex gap-4 items-center'>
                    <Label className="text-xs font-medium ">
                        Campaign Period
                    </Label>
                    <Button type='button' onClick={applyToAll} className='h-7 text-[0.65rem]' variant="outline" size="sm">Apply to All</Button>
                </div>
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
                                    sites: prev.sites.map((row, i) =>
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
                                    sites: prev.sites.map((row, i) =>
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
                        {monthDifference} month/s
                    </span>
                </div>
            </div>
            <div className='w-full flex gap-4'>
                <div className="space-y-2 w-full">
                    <Label className="text-xs font-medium ">
                        Negotiated Monthly Rate (Final)
                    </Label>

                    <InputNumber
                        value={item.package_rate}
                        groupClassName="w-full"
                        onChange={(e) => {
                            setCart((prev) => ({
                                ...prev,
                                sites: prev.sites.map((row, i) =>
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
                            SRP:
                        </span>

                        <span className="font-medium ">
                            {formatAmount(item.srp)}
                        </span>
                    </div>
                </div>
                <div className="space-y-2 w-full">
                    <Label className="text-xs font-medium ">
                        Offered Monthly Rate (for rate card display only)
                    </Label>

                    <InputNumber
                        value={item.offered_rate}
                        groupClassName="w-full"
                        onChange={(e) => {
                            setCart((prev) => ({
                                ...prev,
                                sites: prev.sites.map((row, i) =>
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
                </div>
            </div>

            <div className='leading-tight space-y-2'>
                <Label className='text-xs'>Installation and Dismantling</Label>
                <section className='grid grid-cols-2 gap-4'>
                    <div className='grid grid-cols-[auto_1fr] gap-4'>
                        <div>
                            <InputGroup className='overflow-hidden bg-white max-w-[150px]'>
                                <InputGroupAddon align="inline-start" className='bg-zinc-100 px-2 h-full whitespace-nowrap'>
                                    CTC Qty:
                                </InputGroupAddon>
                                <InputNumber groupClassName='border-none' isMoney={false} min={0} value={item.installation.paid} onChange={(e) => {
                                    setCart((prev) => ({
                                        ...prev,
                                        sites: prev.sites.map((row, idx) =>
                                            idx === index
                                                ? {
                                                    ...row,
                                                    installation: {
                                                        ...row.installation,
                                                        paid: Number(e.target.value)
                                                    }
                                                }
                                                : row
                                        ),
                                    }));
                                }} />
                            </InputGroup>
                        </div>
                        <div>
                            <InputGroup className='overflow-hidden bg-white'>
                                <InputGroupAddon align="inline-start" className='bg-zinc-100 px-2 h-full whitespace-nowrap'>
                                    Rate:
                                </InputGroupAddon>
                                <InputNumber groupClassName='border-none' min={0} disabled={item.installation.paid === 0} value={item.installation.cost} onChange={(e) => {
                                    setCart((prev) => ({
                                        ...prev,
                                        sites: prev.sites.map((row, idx) =>
                                            idx === index
                                                ? {
                                                    ...row,
                                                    installation: {
                                                        ...row.installation,
                                                        cost: Number(e.target.value)
                                                    }
                                                }
                                                : row
                                        ),
                                    }));
                                }} />
                                <InputGroupAddon align="inline-end" className='bg-zinc-100 pl-2 h-full'>
                                    <span>Value:</span>
                                    <span>{formatAmount(item.installation.cost * item.installation.paid)}</span>
                                </InputGroupAddon>
                            </InputGroup>
                            <div className="flex items-center gap-1 text-[11px] pt-1">
                                <span className="">
                                    SRP:
                                </span>

                                <span className="font-medium ">
                                    {formatAmount(getSiteInstallationCost(item.site.size, item.site.region))}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <InputGroup className='overflow-hidden bg-white'>
                            <InputGroupAddon align="inline-start" className='bg-zinc-100 px-2 h-full whitespace-nowrap'>
                                Free Qty:
                            </InputGroupAddon>
                            <InputNumber groupClassName='border-none' isMoney={false} min={0} value={item.installation.free} onChange={(e) => {
                                setCart((prev) => ({
                                    ...prev,
                                    sites: prev.sites.map((row, idx) =>
                                        idx === index
                                            ? {
                                                ...row,
                                                installation: {
                                                    ...row.installation,
                                                    free: Number(e.target.value)
                                                }
                                            }
                                            : row
                                    ),
                                }));
                            }} />
                            <InputGroupAddon align="inline-end" className='bg-zinc-100 pl-2 h-full'>
                                <span>Value:</span>
                                <span>{formatAmount(getSiteInstallationCost(item.site.size, item.site.region) * item.installation.free)}</span>
                            </InputGroupAddon>
                        </InputGroup>
                        <span className='text-[0.6rem] italic'>*on top of the standard free installation and dismantling</span>
                    </div>
                </section>
            </div>
            <div className='leading-tight space-y-2'>
                <Label className='text-xs'>Printing</Label>
                <section className='grid grid-cols-2 gap-4'>
                    <div className='grid grid-cols-[auto_1fr] gap-4'>
                        <div>
                            <InputGroup className='overflow-hidden bg-white max-w-[150px]'>
                                <InputGroupAddon align="inline-start" className='bg-zinc-100 px-2 h-full whitespace-nowrap'>
                                    CTC Qty:
                                </InputGroupAddon>
                                <InputNumber groupClassName='border-none' isMoney={false} min={0} value={item.material.paid} onChange={(e) => {
                                    setCart((prev) => ({
                                        ...prev,
                                        sites: prev.sites.map((row, idx) =>
                                            idx === index
                                                ? {
                                                    ...row,
                                                    material: {
                                                        ...row.material,
                                                        paid: Number(e.target.value)
                                                    }
                                                }
                                                : row
                                        ),
                                    }));
                                }} />
                            </InputGroup>
                        </div>
                        <div>
                            <InputGroup className='overflow-hidden bg-white'>
                                <InputGroupAddon align="inline-start" className='bg-zinc-100 px-2 h-full whitespace-nowrap'>
                                    Rate/sqft:
                                </InputGroupAddon>
                                <InputNumber groupClassName='border-none' min={0} disabled={item.material.paid === 0} value={item.material.cost} onChange={(e) => {
                                    setCart((prev) => ({
                                        ...prev,
                                        sites: prev.sites.map((row, idx) =>
                                            idx === index
                                                ? {
                                                    ...row,
                                                    material: {
                                                        ...row.material,
                                                        cost: Number(e.target.value)
                                                    }
                                                }
                                                : row
                                        ),
                                    }));
                                }} />
                                <InputGroupAddon align="inline-end" className='bg-zinc-100 pl-2 h-full'>
                                    <span>Value:</span>
                                    <span>{formatAmount(getSiteMaterial(item.site.size, item.site.site_code, item.material.cost) * item.material.paid)}</span>
                                </InputGroupAddon>
                            </InputGroup>
                            <div className="flex items-center gap-1 text-[11px] pt-1">
                                <span className="">
                                    SRP/sqft:
                                </span>

                                <span className="font-medium ">
                                    {formatAmount(getCost(item.site.site_code))}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <InputGroup className='overflow-hidden bg-white'>
                            <InputGroupAddon align="inline-start" className='bg-zinc-100 px-2 h-full whitespace-nowrap'>
                                Free Qty:
                            </InputGroupAddon>
                            <InputNumber groupClassName='border-none' isMoney={false} min={0} value={item.material.free} onChange={(e) => {
                                setCart((prev) => ({
                                    ...prev,
                                    sites: prev.sites.map((row, idx) =>
                                        idx === index
                                            ? {
                                                ...row,
                                                material: {
                                                    ...row.material,
                                                    free: Number(e.target.value)
                                                }
                                            }
                                            : row
                                    ),
                                }));
                            }} />
                            <InputGroupAddon align="inline-end" className='bg-zinc-100 pl-2 h-full'>
                                <span>Value:</span>
                                <span>{formatAmount(getSiteMaterial(item.site.size, item.site.site_code) * item.material.free)}</span>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </section>
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
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="">
                                        SRP Total
                                        <span className="ml-1">({monthDifference} mo.)</span>
                                    </span>
                                    <span>{formatAmount(srpTotal)}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="">
                                        Negotiated Rate Total
                                        <span className="ml-1">({monthDifference} mo.)</span>
                                    </span>
                                    <span>
                                        {formatAmount(
                                            Number(item.package_rate) * monthDifference
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="">
                                        Add-ons Total
                                    </span>
                                    <span>
                                        {formatAmount(addOnTotal)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                <div className={cn("transition-all", showBreakdown ? "my-3 border-t" : "")} />
                <div className='flex justify-between items-center'>
                    <p className="text-xs ">
                        Site Package Value
                    </p>
                    <p className="text-xl font-semibold tracking-tight">
                        {formatAmount(totalNetAmount)}
                    </p>
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
}

export default SiteItem