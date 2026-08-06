import { format, isToday } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { useCurrentWeekReport } from "@/hooks/useDashboard";
import { ScrollArea } from "../ui/scroll-area";
import UserAvatar from "../ui/user-avatar";
import { Badge } from "../ui/badge";

const WeeklyReportsCard = () => {
  const { data: thisWeeksReports, isLoading: isWeeklyReportLoading } =
    useCurrentWeekReport();
  return (
    <>
      <ScrollArea className="h-[300px]">

        <div className="flex flex-col gap-6 pt-2">
          {isWeeklyReportLoading ? (
            <>{Array(10).fill(0).map(() => {
              return <Skeleton className="w-full h-32" />
            })}</>
          ) : (
            <>
              {thisWeeksReports ? thisWeeksReports.map((report) => {
                const dateSubmitted = new Date(report.date);
                let timestamp = format(dateSubmitted, "MM/dd");
                if (isToday(dateSubmitted)) {
                  timestamp = format(dateSubmitted, "p");
                }
                return (
                  <div
                    key={report.report_id}
                    className="relative grid grid-cols-[auto,1fr] items-start gap-x-4"
                  >
                    <UserAvatar fallback={report.code} image={report.image} tooltip={report.ae} sales_unit={report.sales_unit} />
                    <div className="grid gap-1">
                      <p className="font-semibold uppercase text-sm max-w-sm line-clamp-1">
                        {report.client}
                      </p>
                      <p className="text-xs max-w-md line-clamp-2">
                        {report.report}
                      </p>
                      {report.tags.length > 0 &&
                        <div className="flex items-center gap-1 pt-1">
                          {report.tags.map(tag => <Badge key={`${report.report_id}_${tag}`} className="bg-main-100 rounded-full capitalize text-[0.65rem]">{tag.toLowerCase()}</Badge>)}
                        </div>
                      }
                    </div>
                    <div className="absolute top-0 right-0 h-full flex gap-4 items-start">
                      <p className="text-xs text-slate-400/50">
                        {timestamp}
                      </p>
                    </div>
                  </div>
                );
              }) : <p className="text-center text-zinc-600">No activities found.</p>}
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default WeeklyReportsCard;
