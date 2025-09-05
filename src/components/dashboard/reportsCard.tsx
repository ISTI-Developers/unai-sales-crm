import {
  FileChartColumnIncreasing,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import DashboardCard from "../DashboardCard";
import useReportSummary from "@/data/reportSummary.data";
import { Skeleton } from "../ui/skeleton";
import { useReportsTrend } from "@/hooks/useDashboard";
import { useMemo } from "react";
import { generateWeeks } from "@/data/reports.columns";
import { getISOWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const ReportsCard = () => {
  const weeks = generateWeeks();
  const { thisWeeksReports, isWeeklyReportLoading: isLoading } =
    useReportSummary();
  const { data, isLoading: isTrendLoading } = useReportsTrend();

  const trend = useMemo(() => {
    if (!data || isTrendLoading) return 0;

    if (data.length < 2) return 0;
    const currentCount = data[0].total_records;
    const previousCount = data[1].total_records;
    if (previousCount === 0) return 0; // avoid division by zero

    return (currentCount - previousCount) / previousCount;
  }, [data, isTrendLoading]);

  return (
    <DashboardCard className="relative max-h-fit space-y-4 md:col-[5/7] lg:max-h-full lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center justify-between gap-1.5">
        <p>{weeks[getISOWeek(new Date()) - 1]} Activities</p>
        <div className="rounded-full bg-red-50 text-red-600 p-2">
          <FileChartColumnIncreasing />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-12" />
      ) : (
        <>
          <p className="text-4xl 2xl:text-5xl font-light">{thisWeeksReports.length ?? 0}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute bottom-0 right-0 p-4 px-6 text-[0.65rem] flex items-end gap-1">
                <div
                  className={cn(
                    "flex items-end text-xs gap-1 font-semibold p-1 px-2 rounded-full",
                    trend > 0 ? "text-green-500 bg-green-200/70 border border-green-300/50" : "text-red-400 bg-red-200/70 border border-red-300/50"
                  )}
                >
                  {trend > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <p className="text-xs">{Math.abs((trend ?? 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              from last week
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </DashboardCard>
  );
};

export default ReportsCard;
