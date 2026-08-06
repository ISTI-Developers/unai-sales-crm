import { useMemo } from "react";
import { useCurrentWeekReport } from "@/hooks/useDashboard";

export interface Report {
  report_id: number;
  sales_unit: string;
  status: string;
  date: string;
}

const useReportSummary = () => {
  const { data: thisWeekReports, isLoading: isWeeklyReportLoading } =
    useCurrentWeekReport();

  const thisWeeksReports = useMemo(() => {
    if (!thisWeekReports || thisWeekReports.length === 0) return [];

    return thisWeekReports.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [thisWeekReports]);

  return {
    thisWeeksReports,
    isWeeklyReportLoading,
  };
};

export default useReportSummary;
