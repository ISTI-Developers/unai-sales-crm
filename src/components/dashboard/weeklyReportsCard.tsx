import { generateWeeks } from "@/data/reports.columns";
import useReportSummary from "@/data/reportSummary.data";
import { addHours, format, getISOWeek, isToday } from "date-fns";
import { useMemo } from "react";
import DashboardCard from "../DashboardCard";
import { Skeleton } from "../ui/skeleton";

const WeeklyReportsCard = () => {
  const weeks = useMemo(() => generateWeeks(), []);
  const currentWeek = getISOWeek(new Date());
  const { thisWeeksReports, reportsSummaryConfig, isWeeklyReportLoading } =
    useReportSummary();
  return (
    <DashboardCard className="space-y-4 md:row-[3/4] md:col-[4/7] xl:row-[3/5] xl:col-[7/10] max-h-[500px] xl:max-h-full overflow-y-auto p-0">
      <h1 className="sticky top-0 bg-white w-full p-4 z-0">{weeks[currentWeek - 1]} Activities</h1>
      <div className="flex flex-col gap-6 p-6 pt-0">
        {isWeeklyReportLoading ? (
          <>{Array(10).fill(0).map(() => {
            return <Skeleton className="w-full h-32"/>
          })}</>
        ) : (
          <>
            {thisWeeksReports.length > 0 ? thisWeeksReports.map((report) => {
              const dateSubmitted = addHours(new Date(report.date), import.meta.env.VITE_TIME_ADJUST);
              let timestamp = format(dateSubmitted, "MM/dd");
              if (isToday(dateSubmitted)) {
                timestamp = format(dateSubmitted, "p");
              }
              console.log(reportsSummaryConfig[
                  report.sales_unit
                    .split(" ")
                    .join("_") as keyof typeof reportsSummaryConfig
                ])
              const color =
                reportsSummaryConfig[
                  report.sales_unit
                    .split(" ")
                    .join("_") as keyof typeof reportsSummaryConfig
                ]?.color;
              return (
                <div
                  key={report.report_id}
                  className="relative grid grid-cols-[auto,1fr] items-start gap-x-4"
                >
                  <p
                    className="border rounded-full text-xs tracking-tighter uppercase w-12 h-12 flex items-center justify-center text-center row-[1/3] font-semibold"
                    style={{
                      borderColor: color,
                      backgroundColor: `${color}30`,
                      color: color,
                    }}
                  >
                    {report.ae}
                  </p>
                  <p className="font-semibold uppercase text-sm">
                    {report.client.substring(0, 24)}
                    {report.client.length > 24 && "..."}
                  </p>

                  <p className="col-[2/3] text-xs">
                    {report.report.substring(0, 50)}
                    {report.report.length > 50 && "..."}
                  </p>

                  <p className="absolute top-0 right-0 text-xs text-slate-400/50">
                    {timestamp}
                  </p>
                </div>
              );
            }) : <p className="text-center text-zinc-600">No activities found.</p>}
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default WeeklyReportsCard;
