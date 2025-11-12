
import useReportSummary from "@/data/reportSummary.data";
import { addHours, format, isToday } from "date-fns";
import { Skeleton } from "../ui/skeleton";

const WeeklyReportsCard = () => {
  const { thisWeeksReports, reportsSummaryConfig, isWeeklyReportLoading } =
    useReportSummary();
  return (
    <>
      <div className="flex flex-col gap-6 pt-2 max-h-[300px] overflow-y-auto">
        {isWeeklyReportLoading ? (
          <>{Array(10).fill(0).map(() => {
            return <Skeleton className="w-full h-32" />
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
                    {report.client.substring(0, 30)}
                    {report.client.length > 30 && "..."}
                  </p>

                  <p className="col-[2/3] text-xs">
                    {report.report.substring(0, 60)}
                    {report.report.length > 60 && "..."}
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
    </>
  );
};

export default WeeklyReportsCard;
