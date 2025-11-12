import DashboardCard from "../DashboardCard";
import { BookUser, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useMemo } from "react";
import { addHours, getMonth, getYear } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

function ClientCard() {
  const { data, isLoading } = useClients();

  const count = useMemo(() => {
    if (!data || isLoading) return { total: 0, trend: 0 };

    const trendCount = data.filter(item => getMonth(addHours(new Date(item.created_at), import.meta.env.VITE_TIME_ADJUST)) === getMonth(new Date()) && getYear(new Date(item.created_at)) === getYear(new Date())).length
    const totalCount = data.length;

    return {
      total: totalCount,
      trend: trendCount > 0 && totalCount > 0 ? (trendCount / totalCount) : 0
    }
  }, [data, isLoading])

  return (
    <DashboardCard className="relative max-h-fit space-y-4 md:col-[1/3] lg:max-h-full lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center justify-between gap-1.5">
        <p>Clients</p>
        <div className="rounded-full bg-blue-50 text-blue-600 p-2">
          <BookUser />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-12" />
      ) : (
        <>
          <p className="text-4xl 2xl:text-5xl font-light ">{count.total}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute bottom-0 right-0 p-4 px-6 text-[0.65rem] flex items-end gap-1 select-none">
                <div
                  className={cn(
                    "flex items-end text-xs gap-1 font-semibold p-1 px-2 rounded-full",
                    count.trend > 0 ? "text-green-500 bg-green-200/70 border border-green-300/50" : "text-red-400 bg-red-200/70 border border-red-300/50"
                  )}
                >
                  {count.trend > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <p className="text-xs">{Math.abs((count.trend ?? 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              from last month
            </TooltipContent>
          </Tooltip>
        </>
      )}

    </DashboardCard>
  );
}

export default ClientCard;
