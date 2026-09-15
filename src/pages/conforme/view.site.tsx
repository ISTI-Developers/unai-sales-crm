import { useSiteByID } from "@/hooks/useSites";
import { CartSite } from "@/interfaces/requests.interface";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatDateRange } from "@/lib/format";
import { cn, getSiteInstallationCost, getSiteMaterial, getTotalGivenRateBySite, getTotalSiteSRPBySite } from "@/lib/utils";
import { addDays, differenceInCalendarMonths } from "date-fns";
import { useMemo } from "react";

export const ConformeSiteDetails = ({ cartSite }: { cartSite: CartSite }) => {
    const { data: site, isLoading } = useSiteByID(cartSite.ID);

    const paidAddOnsTotal = useMemo(() => {
        if (!site || cartSite.material.paid === 0 || cartSite.installation.paid === 0) return 0;
        const materialCost = cartSite.material.paid * getSiteMaterial(site.size, site.site_code, cartSite.material.cost);
        const installationCost = cartSite.installation.paid * cartSite.installation.cost > 0 ? cartSite.installation.cost : getSiteInstallationCost(site.size, site.region)

        return materialCost + installationCost;
    }, [site, cartSite.material, cartSite.installation])

    if (!site || isLoading) {
        return <>Loading...</>
    }
    const duration = differenceInCalendarMonths(addDays(new Date(cartSite.to), 1), new Date(cartSite.from));
    const isFree = cartSite.package_rate === 0;

    const totalSRP = getTotalSiteSRPBySite(site, cartSite.installation, cartSite.material, duration);
    const totalPackage = getTotalGivenRateBySite(cartSite.package_rate * duration, site, cartSite.installation, cartSite.material)
    const grandTotal = totalPackage - cartSite.add_on_total;
    const margin = grandTotal - totalSRP;


    console.log(site, cartSite)
    return <div className="grid gap-3 p-4 border rounded-xl">
        <header className="grid grid-cols-2 gap-2">
            <div>
                <div className="flex gap-1 items-center">
                    <p className="font-semibold leading-tight">{site.site_code}</p>
                    <p className="text-xs leading-tight">({site.size})</p>
                </div>
                <p className="text-xs text-zinc-500 leading-tight">{site.address}</p>
                <p className="text-[0.65rem] italic text-zinc-400 leading-tight">{site.board_facing}</p>
                <div className="flex items-center gap-1 text-sm font-semibold pt-1">
                    <span>SRP: </span>
                    <span className="leading-tight">{formatAmount(cartSite.srp)}/mo</span>
                </div>
            </div>
            <div className="flex flex-col items-end text-sm self-start justify-end">
                <span className="leading-tight font-semibold">{duration} month{duration > 1 ? "s" : ""}</span>
                <span className="leading-tight">{formatDateRange(new Date(cartSite.from), new Date(cartSite.to))}</span>
            </div>
        </header>
        <hr />
        <div className="flex flex-col gap-1 text-sm">
            {/* Base Rate */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                    Negotiated Monthly Rate
                </span>

                <span>
                    {formatAmount(cartSite.package_rate)}
                </span>
            </div>

            {/* Add-ons */}
            {cartSite.add_on_total > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                            Add-ons
                        </span>
                    </div>

                    <div className="pl-3 flex flex-col gap-1.5">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-700">
                                Chargeable Add-ons
                            </span>
                            <span>
                                {formatAmount(paidAddOnsTotal)}
                            </span>
                        </div>
                        {paidAddOnsTotal > 0 && <>
                            <div className="grid gap-1.5">
                                <AddOnBreakdown
                                    label="Installation"
                                    free={0}
                                    paid={cartSite.installation.paid}
                                    cost={cartSite.installation.cost}
                                    srp={getSiteInstallationCost(site.size, site.region)}
                                />
                                <AddOnBreakdown
                                    label="Printing"
                                    free={0}
                                    paid={cartSite.material.paid}
                                    cost={getSiteMaterial(site.size, site.site_code, cartSite.material.cost)}
                                    srp={getSiteMaterial(site.size, site.site_code)}
                                />
                            </div>
                        </>}
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-700">
                                Waived Add-ons
                            </span>
                            <span className="text-red-400">
                                {formatAmount(cartSite.add_on_total)}
                            </span>
                        </div>
                        <div className="grid gap-1.5 text-red-400/60">
                            <AddOnBreakdown
                                label="Installation"
                                free={cartSite.installation.free}
                                paid={0}
                                srp={getSiteInstallationCost(site.size, site.region)}
                            />
                            <AddOnBreakdown
                                label="Printing"
                                free={cartSite.material.free}
                                paid={0}
                                srp={getSiteMaterial(site.size, site.site_code)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <hr  className="mt-1"/>

            {/* Total */}
            <div className="flex items-end justify-between">
                <div>
                    <span className="text-xs font-semibold">
                        Total Package Value
                    </span>

                    <p className="text-[11px] text-gray-500">
                        After add-on adjustments
                    </p>
                </div>

                <span className="text-lg font-semibold">
                    {isFree ? "FREE" : formatAmount(grandTotal)}
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
    </div>
}

const AddOnBreakdown = ({
    label,
    free,
    paid,
    cost,
    srp,
}: {
    label: string;
    free: number;
    paid: number;
    cost?: number;
    srp?: number;
}) => {
    if (free <= 0 && paid <= 0) return null;

    if (free > 0) {
        return (
            <div className="flex justify-between text-xs indent-4 leading-tight">
                <span className="text-gray-500">
                    {free}x {label}
                </span>
                <span>
                    {formatAmount(srp ?? cost ?? 0 * free)}
                </span>
            </div>
        )
    }
    if (paid > 0) {
        return <div className="flex justify-between text-xs indent-4 leading-tight">
            <span className="text-gray-500">
                {paid}x {label}
            </span>
            <span>
                {formatAmount(cost ?? srp ?? 0 * paid)}
            </span>
        </div>
    }
}
// return (
//     <div className="flex flex-col gap-1">
//         <p className="font-semibold">{label}</p>

//         <div className="pl-4 flex flex-col gap-1 text-sm">
//             {free > 0 && (
//                 <div className="flex justify-between">
//                     <span className="text-gray-500">
//                         Free × {free}
//                     </span>
//                     <span>
//                         {formatAmount(cost * free)}
//                     </span>
//                 </div>
//             )}

//             {paid > 0 && (
//                 <div className="flex justify-between">
//                     <span className="text-gray-500">
//                         Client × {paid}
//                     </span>
//                     <span>
//                         {formatAmount(cost * paid)}
//                     </span>
//                 </div>
//             )}
//         </div>
//     </div>
// );