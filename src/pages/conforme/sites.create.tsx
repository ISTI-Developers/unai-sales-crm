import { Cart, SiteRow } from '@/interfaces/requests.interface'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import SiteItem from './siteItem.create';
import { formatAmount } from '@/lib/format';
import { addDays, differenceInCalendarDays, differenceInCalendarMonths } from 'date-fns';
import { cn, getAddOnTotal, getTotalGivenRate, getTotalSiteSRP } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TagIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import LEDItem from './ledItem.create';

interface SitesTabsProps {
    cart: Cart;
    setCart: Dispatch<SetStateAction<Cart>>;
}
function SitesTabs({ cart, setCart }: SitesTabsProps) {

    const selectedSites = useMemo(() => {
        return [...cart.sites.map(item => {
            return { ...item, type: "static" as const }
        }), ...cart.leds.map(item => {
            return { ...item, type: "led" as const }
        })];
    }, [cart.leds, cart.sites])

    const [activeTab, setActiveTab] = useState(selectedSites[0].site.site_code);
    useEffect(() => {
        const siteLength = selectedSites.length
        setActiveTab(selectedSites[Math.max(siteLength - 1, 0)].site.site_code)
    }, [selectedSites.length])
    return (
        <div className='grid grid-cols-[350px_1fr]'>
            <ScrollArea className='border-r'>
                <section className='max-h-[500px]'>
                    {selectedSites.map((item, index) => {
                        const addOnTotal = item.type === "static" ? getAddOnTotal(item as SiteRow) : 0;

                        const packageRate = Number(item.package_rate);
                        const srp = Number(item.srp);
                        let difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
                        let spotsRate = 1;
                        let spotsCount = 1;
                        let contractAmount = 0;
                        let srpTotal = srp * difference;

                        if (item.type === "led") {
                            difference = Math.round(Math.max(differenceInCalendarDays(addDays(item.date.to, 1), item.date.from), 0) / 30) * 30
                            spotsRate = Number(item.spots_rate);
                            spotsCount = item.spots_count;
                            const hasPackageRate = packageRate > 0;
                            const isFree = item.is_free;
                            if (packageRate > 0) {
                                spotsCount = packageRate / difference / (spotsRate > 0 ? spotsRate : srp)
                            }

                            // Package rate determines the actual number of spots
                            if (hasPackageRate) {
                                spotsCount = Math.floor(
                                    packageRate / difference / spotsRate
                                );
                            }

                            // SRP is always based on the actual number of spots
                            srpTotal = isFree ? hasPackageRate ? packageRate : spotsCount * difference * srp : spotsCount * difference * srp;
                            contractAmount = isFree
                                ? 0
                                : hasPackageRate
                                    ? packageRate
                                    : spotsCount * difference * spotsRate;
                        } else {
                            contractAmount = getTotalGivenRate(packageRate * difference, item);
                            srpTotal = getTotalSiteSRP(item, difference);
                        }

                        let margin = contractAmount - srpTotal;
                        if (item.type === "static") {
                            margin = contractAmount - addOnTotal - srpTotal;
                        }



                        return <div role='button' onClick={() => setActiveTab(item.site.site_code)} data-active={item.site.site_code === activeTab} key={index} className='p-3 hover:bg-zinc-50 data-[active=true]:bg-zinc-600 data-[active=true]:text-white data-[active=true]:hover:bg-zinc-700 space-y-2'>
                            <div className='text-xs'>
                                <p className='text-sm font-medium'>{item.site.site_code} <span className='text-[0.65rem]'>{item.site.size}</span></p>
                                <p className='text-[0.65rem] line-clamp-2' title={item.site.address}>{item.site.address}</p>
                            </div>
                            <div className='flex items-center gap-1 text-xs font-semibold'>
                                <CalendarIcon size={14} />
                                <span>{difference} {item.type === "led" ? "days" : "months"}</span>
                            </div>
                            <div className='font-semibold flex items-center gap-1 text-sm'>
                                <TagIcon size={14} />
                                <p>{formatAmount(contractAmount)}</p>
                                <Badge
                                    className={cn(
                                        "gap-1 h-5 px-2 text-[0.6rem] shadow-none",
                                        margin >= 0
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200"
                                    )}
                                >
                                    {margin >= 0 ? (
                                        <TrendingUp size={10} />
                                    ) : (
                                        <TrendingDown size={10} />
                                    )}

                                    {formatAmount(Math.abs(margin))}
                                </Badge>
                                {contractAmount === 0 &&
                                    <Badge className='bg-sky-100 text-sky-600 shadow-none'>FREE</Badge>}
                            </div>
                        </div>
                    })}
                </section>
            </ScrollArea>
            {cart.sites.map((item, index) => {
                return <section key={index} data-active={item.site.site_code === activeTab} className='hidden data-[active=true]:block bg-zinc-100'>
                    <SiteItem item={item} index={index} setCart={setCart} cart={cart} />
                </section>
            })}
            {cart.leds.map((item, index) => {
                return <section key={index} data-active={item.site.site_code === activeTab} className='hidden data-[active=true]:block bg-zinc-100'>
                    <LEDItem item={item} index={index} setCart={setCart} cart={cart} />
                </section>
            })}
        </div>
    )
}

export default SitesTabs