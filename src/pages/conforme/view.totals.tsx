import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/useSites";
import { CartDetails } from "@/interfaces/requests.interface";
import { formatAmount } from "@/lib/format";
import { cn, getSiteInstallationCost, getSiteMaterial, getTotalDaily, getTotalGivenRateBySite, getTotalSiteSRPBySite } from "@/lib/utils";
import { addDays, differenceInCalendarMonths } from "date-fns";

export const ConformeRatesTotal = ({ details }: { details: CartDetails }) => {
    const { data: sites = [] } = useSites();
    const selectedSites = [...details.sites.map(item => ({ ...item, type: "static" as const })), ...details.leds.map(item => ({ ...item, type: "led" as const }))];
    const totalSRP = selectedSites.reduce((acc, item) => {
        if (item.type === "static") {
            const difference = differenceInCalendarMonths(addDays(new Date(item.to), 1), new Date(item.from));
            const site = sites.find(s => s.ID === item.ID);
            acc += getTotalSiteSRPBySite(site!, item.installation, item.material, difference);
        } else if (item) {
            acc += getTotalDaily(item.srp, new Date(item.to), new Date(item.from)) * item.spots_count
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
                <h3 className="font-semibold">Package Summary</h3>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Total SRP</span>
                        <span>{formatAmount(totalSRP)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Total Package Rate</span>
                        <span>{formatAmount(totalPackageRate)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs">Free Add-ons Value</span>
                        <span className="font-medium text-red-300">
                            {formatAmount(totalAddOns)}
                        </span>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Grand Total</span>
                        <span className="text-xl font-bold">
                            {formatAmount(totalNetAmount)}
                        </span>
                    </div>
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
            </div >
        </>
    );
}