import { Monitor } from "lucide-react";
import DashboardCard from "../DashboardCard";
import { useSites } from "@/hooks/useSites";
import { Skeleton } from "../ui/skeleton";

const SitesCard = () => {
  const { data, isLoading } = useSites();
  return (
    <DashboardCard className="relative max-h-fit space-y-4 md:col-[3/5] lg:max-h-full lg:flex lg:flex-col lg:justify-between pb-4">
      <div className="flex items-center justify-between gap-1.5">
        <p>Sites</p>
        <div className="rounded-full bg-emerald-50 text-emerald-600 p-2">
          <Monitor />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-12" />
      ) : (
        <p className="text-4xl 2xl:text-5xl font-light">{data?.length ?? 0}</p>
      )}
      {/* <div className="absolute bottom-0 right-0 p-4 px-6 text-xs flex items-end gap-1">
        <div className="flex items-end text-sm gap-0.5 text-green-400 font-semibold">
          <TrendingUp />
          <p>2.1%</p>
        </div>
        <p className="tracking-tight text-slate-400">from last month</p>
      </div> */}
    </DashboardCard>
  );
};

export default SitesCard;
