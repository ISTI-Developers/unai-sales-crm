import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/useSites";
import { CartDetails } from "@/interfaces/requests.interface";
import { formatAmount } from "@/lib/format";
import { cn, getSiteInstallationCost, getSiteMaterial, getTotalChargeablesBySite, getTotalDaily, getTotalGivenRateBySite, getTotalSiteSRPBySite } from "@/lib/utils";
import { addDays, differenceInCalendarDays, differenceInCalendarMonths } from "date-fns";

export const ConformeRatesTotal = ({ details }: { details: CartDetails }) => {
    const { data: sites = [] } = useSites();
    const selectedSites = [...details.sites.map(item => ({ ...item, type: "static" as const })), ...details.leds.map(item => ({ ...item, type: "led" as const }))];
    //   const totalSRP = selectedSites.reduce((acc, item) => {
    //     if (item.type === "static") {
    //       const difference = differenceInCalendarMonths(addDays(item.date.to, 1), item.date.from);
    //       const addOnsTotal = getAddOnTotal(item);
    //       acc += getTotalSiteSRP(item, difference) + addOnsTotal;
    //     } else {
    //       const days = Math.round(Math.max(differenceInCalendarDays(addDays(item.date.to, 1), item.date.from), 0) / 30) * 30;
    //       const srp = Number(item.srp);
    //       const spotsRate = Number(item.spots_rate);
    //       const packageRate = Number(item.package_rate);

    //       const hasPackageRate = packageRate > 0;
    //       const isFree = item.is_free;

    //       let spotsCount = Number(item.spots_count);
    //       if (hasPackageRate) {
    //         spotsCount = Math.floor(
    //           packageRate / days / spotsRate
    //         );
    //       }
    //       acc += isFree ? hasPackageRate ? packageRate : spotsCount * days * srp : spotsCount * days * srp;
    //     }
    //     return acc;
    //   }, 0)
    const totalSRP = selectedSites.reduce((acc, item) => {
        if (item.type === "static") {
            const difference = differenceInCalendarMonths(addDays(new Date(item.to), 1), new Date(item.from));
            const site = sites.find(s => s.ID === item.ID);
            acc += getTotalSiteSRPBySite(site!, item.installation, item.material, difference) + item.add_on_total;
        } else if (item.type === "led") {
            const days = Math.round(Math.max(differenceInCalendarDays(addDays(item.to, 1), item.from), 0) / 30) * 30;
            const srp = Number(item.srp);
            const packageRate = Number(item.package_rate);
            let spotsCount = Number(item.spots_count);
            const hasPackageRate = packageRate > 0;
            const isFree = item.is_free;
            if (hasPackageRate) {
                spotsCount = Math.floor(
                    packageRate / days / srp
                );
            }
            acc += isFree ? hasPackageRate ? packageRate : spotsCount * days * srp : spotsCount * days * srp;
        }
        return acc;
    }, 0)
    const totalPackageRental = selectedSites.reduce((acc, item) => {
        const packageRate = Number(item.package_rate);
        if (item.type === "static") {
            const difference = differenceInCalendarMonths(addDays(new Date(item.to), 1), new Date(item.from));
            acc += packageRate * difference;
        } else {
            if (item.is_free) {
                acc += 0;
            } else {
                if (packageRate > 0) {
                    acc += packageRate;
                } else {
                    const contractRate = item.spots_count * item.srp;
                    acc += getTotalDaily(contractRate, new Date(item.to), new Date(item.from))
                }
            }
        }
        return acc;
    }, 0)
    const totalPackageRate = selectedSites.reduce((acc, item) => {
        const packageRate = Number(item.package_rate);
        if (item.type === "static") {
            const difference = differenceInCalendarMonths(addDays(new Date(item.to), 1), new Date(item.from));
            const site = sites.find(s => s.ID === item.ID);
            acc += getTotalGivenRateBySite(packageRate * difference, site!, item.installation, item.material);
        } else {
            if (item.is_free) {
                acc += 0;
            } else {
                if (packageRate > 0) {
                    acc += packageRate;
                } else {
                    const contractRate = item.spots_count * item.srp;
                    acc += getTotalDaily(contractRate, new Date(item.to), new Date(item.from))
                }
            }
        }
        return acc;
    }, 0)
    const totalBillableAddOns = selectedSites.reduce((acc, item) => {
        if (item.type === "static") {
            const site = sites.find(s => s.ID === item.ID);
            acc += getTotalChargeablesBySite(item.installation, item.material, site);
        }
        return acc;
    }, 0)
    const globalFreeAddOns = details.add_ons.reduce((acc, item) => {
        if (item.is_free) {
            acc += item.total;
        }
        return acc
    }, 0)

    const globalPaidAddOns = details.add_ons.reduce((acc, item) => {
        if (!item.is_free) {
            acc += item.total;
        }
        return acc
    }, 0)

    const freeSitesAndLEDs = selectedSites.reduce((acc, item) => {
        if (item.type === 'led') {
            if (item.is_free) {
                const contractAmount = getTotalDaily(item.srp, new Date(item.to), new Date(item.from)) * item.spots_count
                acc += contractAmount
            }
        } else {
            if (item.package_rate === 0) {
                const site = sites.find(s => s.ID === item.ID);
                const difference = differenceInCalendarMonths(addDays(new Date(item.to), 1), new Date(item.from));
                acc += getTotalSiteSRPBySite(site!, item.installation, item.material, difference);
            }
        }
        return acc;
    }, 0)
    const siteAddOns = details.sites.reduce((acc, item) => {
        const { installation, material } = item;
        const site = sites.find(s => s.ID === item.ID);

        if (!site) return 0;
        const installationAmt =
            getSiteInstallationCost(site.size, site.region) *
            installation.free;
        const materialAmt =
            getSiteMaterial(site.size, site.site_code) * material.free;
        return acc += installationAmt + materialAmt;;
    }, 0)

    const totalAddOns = globalFreeAddOns + siteAddOns + freeSitesAndLEDs;

    const totalPackageRateWithPaidAddOns = totalPackageRate + globalPaidAddOns;
    const totalNetAmount = totalPackageRateWithPaidAddOns - totalAddOns;
    const margin = totalNetAmount - totalSRP;
    return (
        <>
            <div className="px-1">
                <h3 className="font-semibold">Package Total</h3>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-2">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Total SRP</span>
                        <span>{formatAmount(totalSRP)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Total Rental</span>
                        <span>{formatAmount(totalPackageRental)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Billable Add-ons</span>
                        <span>
                            {formatAmount(totalBillableAddOns)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Free Add-ons Value</span>
                        <span className="text-red-300">
                            {formatAmount(totalAddOns)}
                        </span>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-zinc-500 text-xs">Total Internal Contract Value</span>
                    <span className="font-medium ">
                        {formatAmount(totalNetAmount)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold mr-auto">Margin</span>
                    <Badge className={cn("flex items-center gap-1 px-3 pl-2", margin >= 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100"
                        : "bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200")}>
                        {margin >= 0 ? "+" : ""}
                        {formatAmount(margin)}
                    </Badge>
                </div>
                <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Contract Amount</span>
                        <span className="text-xl font-bold">
                            {formatAmount(totalPackageRateWithPaidAddOns)}
                        </span>
                    </div>
                </div>
            </div >
        </>
    );
}