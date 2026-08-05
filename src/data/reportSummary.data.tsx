import { useMemo } from "react";
import { useCurrentWeekReport } from "@/hooks/useDashboard";

import { ChartConfig } from "@/components/ui/chart";

export interface Report {
  report_id: number;
  sales_unit: string;
  status: string;
  date: string;
}

const useReportSummary = () => {
  const { data: thisWeekReports, isLoading: isWeeklyReportLoading } =
    useCurrentWeekReport();
  const reportsSummaryConfig = {
    DRF: {
      label: "DRF",
      color: "#991b1b",
    },
    SU_1: {
      label: "SU 1",
      color: "#9a3412",
    },
    SU_2: {
      label: "SU 2",
      color: "#854d0e",
    },
    SU_3: {
      label: "SU 3",
      color: "#065f46",
    },
    SU_4: {
      label: "SU 4",
      color: "#1e40af",
    },
    SU_5: {
      label: "SU 5",
      color: "#1e1b4b",
    },
    "SU_6-V": {
      label: "SU 6",
      color: "#581c87",
    },
    "SU_6-M": {
      label: "SU 6",
      color: "#671fa7",
    },
    SU_7: {
      label: "SU 7",
      color: "#881337",
    },
    MGM: {
      label: "MGM",
      color: "#d1a093"
    },
    Sales: {
      label: "TAMC Sales",
      color: "#a112e3"
    },
    UTASI_Sales: {
      label: "UTASI Sales",
      color: "#f19283"
    }
  } satisfies ChartConfig;

  const thisWeeksReports = useMemo(() => {
    if (!thisWeekReports || thisWeekReports.length === 0) return [];

    return thisWeekReports.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [thisWeekReports]);

  return {
    thisWeeksReports,
    reportsSummaryConfig,
    isWeeklyReportLoading,
  };
};

export default useReportSummary;
