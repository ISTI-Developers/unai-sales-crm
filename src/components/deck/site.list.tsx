import { cn } from "@/lib/utils";
import { useDeck } from "@/providers/deck.provider"
import { format, isBefore } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

const SiteList = () => {
    const { sites, selectedSites, setSelectedSites } = useDeck();
    return (
        <ScrollArea>
            <section className="text-[0.6rem] leading-[1.4] h-full overflow-y-auto scrollbar-none space-y-1">
                {sites.length > 0 ? sites.map(site => {
                    const formattedAvailability = site.availability
                        ? isBefore(new Date(site.availability), new Date()) ? "OPEN" : format(new Date(site.availability), "MMM d, yyyy")
                        : "OPEN";
                    const hasSelected = selectedSites.findIndex(
                        (item) => item.site_code === site.site_code
                    );
                    return (
                        <div role="button" key={site.site_code}
                            onClick={() => {
                                setSelectedSites(prev => {
                                    let exists = false;

                                    const next = prev.filter(item => {
                                        if (item.site_code === site.site_code) {
                                            exists = true;
                                            return false;
                                        }
                                        return true;
                                    });

                                    return exists ? next : [...next, site];
                                });
                            }}
                            className={cn(
                                "p-2 transition-all rounded-sm uppercase items-center border border-zinc-100 hover:bg-zinc-50",
                                hasSelected !== -1
                                    ? "bg-emerald-100 hover:bg-emerald-200 border border-emerald-300"
                                    : ""
                            )}>
                            <div
                                className={cn("w-full relative group")}
                            >
                                <p className="font-bold flex gap-1 items-center">
                                    {site.site_code}
                                </p>
                                <p className="text-[0.4rem] italic font-normal">{site.address}</p>
                                <span className="text-[0.4rem] italic">
                                    {site.board_facing}
                                </span>
                                <p className="text-[0.4rem] text-black/60">{site.client?.toLowerCase().includes("null") ? "N/A" : site.client ?? "N/A"}</p>
                                <p className="text-[0.5rem] font-semibold absolute top-0 right-0">
                                    {formattedAvailability}
                                </p>
                            </div>
                        </div>);
                }) : Array(10).fill(0).map((_, i) => (<Skeleton key={i} className="w-full h-16 bg-zinc-200" />))}
            </section>
        </ScrollArea>
    )
}

export default SiteList