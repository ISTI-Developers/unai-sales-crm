import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/useSites";
import { CartDetails } from "@/interfaces/requests.interface";
import { getTotalBillableAddOns, getTotalContractAmount, getTotalGlobalFreeAddOns, getTotalGlobalPaidAddOns, getTotalRentalCost, getTotalSRP, getFreeSiteAddOns, getSiteInclusions } from "@/lib/conforme";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const ConformeRatesTotal = ({ details }: { details: CartDetails }) => {
    const { data: sites = [] } = useSites();
    const totalSRP = getTotalSRP(details, sites);
    const totalPackageRental = getTotalRentalCost(details)
    const totalPackageRate = getTotalContractAmount(details, sites)
    const totalBillableAddOns = getTotalBillableAddOns(details, sites);
    const globalFreeAddOns = getTotalGlobalFreeAddOns(details)
    const globalPaidAddOns = getTotalGlobalPaidAddOns(details)

    const freeSitesAndLEDs = getFreeSiteAddOns(details, sites);
    const siteAddOns = getSiteInclusions(details, sites)

    const totalAddOns = globalFreeAddOns + siteAddOns + freeSitesAndLEDs;

    const totalPackageRateWithPaidAddOns = totalPackageRate + globalPaidAddOns;
    const totalNetAmount = totalPackageRateWithPaidAddOns - totalAddOns;
    const margin = totalPackageRateWithPaidAddOns - totalSRP;
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