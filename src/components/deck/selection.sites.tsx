import { cn } from "@/lib/utils";
import { useDeck } from "@/providers/deck.provider";
import { format, isBefore } from "date-fns";
import { Badge } from "../ui/badge";
const SiteSelection = () => {
  const { sites, selectedSites, setSelectedSites, setSelectedOptions } =
    useDeck();

  return (
    <div className="h-[calc(100vh-13.375rem)] overflow-y-auto space-y-2 rounded-b-lg">
      {sites.map((site) => {
        const formattedAvailability = site.availability
          ? isBefore(new Date(site.availability), new Date()) ? "OPEN" : format(new Date(site.availability), "MMM d, yyyy")
          : "OPEN";
        const hasSelected = selectedSites.findIndex(
          (item) => item.site_code === site.site_code
        );
        return (
          <div
            role="button"
            key={site.site_code}
            onClick={() => {
              setSelectedSites((prev) => {
                if (prev.find((item) => item.site_code === site.site_code)) {
                  return prev.filter(
                    (item) => item.site_code !== site.site_code
                  );
                } else {
                  return [...prev, site];
                }
              });
              setSelectedOptions((prev) => {
                if (prev.find((item) => item.site_code === site.site_code)) {
                  return prev.filter(
                    (item) => item.site_code !== site.site_code
                  );
                }
                return [
                  ...prev,
                  {
                    site_code: site.site_code,
                    landmarks: [],
                  },
                ];
              });
            }}
            className={cn(
              "flex gap-2 py-4 px-4 transition-all rounded-lg uppercase items-center hover:bg-slate-50",
              hasSelected !== -1
                ? "bg-emerald-100 hover:bg-emerald-200 border border-emerald-300"
                : ""
            )}
          >
            {hasSelected !== -1 && (
              <Badge className="h-5 w-5 text-xs flex items-center justify-center rounded-full bg-emerald-500">
                {hasSelected + 1}
              </Badge>
            )}
            <div
              className={cn("w-full relative group grid grid-cols-[1fr_auto]")}
            >
              <p className="font-bold flex gap-1 items-center">
                {site.site_code}
              </p>
              <p className="text-xs italic font-normal row-[2/3]">{site.address}</p>
              <p className="text-[0.65rem] text-end text-black/60 row-[2/3] col-[2/3]">{site.client?.toLowerCase().includes("null") ? "N/A" : site.client ?? "N/A"}</p>
              <span className="text-[0.65rem] italic col-[1/2] row-[3/4]">
                {site.board_facing}
              </span>
              <p className="text-xs font-semibold col-[2/3] row-[1] text-end">
                {formattedAvailability}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SiteSelection;
