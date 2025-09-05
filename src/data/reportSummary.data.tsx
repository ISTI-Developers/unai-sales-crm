import { useMemo, useState } from "react";
import { useCurrentWeekReport, useReportsSummary } from "@/hooks/useDashboard";
import { useAuth } from "@/providers/auth.provider";
import { ChartConfig } from "@/components/ui/chart";

export interface Report {
  report_id: number;
  sales_unit: string;
  status: string;
  date: string;
}
type DynamicReportSummary = {
  month: string;
  [unitName: string]: string | number;
};
const useReportSummary = () => {
  const MONTH_ORDER = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const { user } = useAuth();
  const { data: thisWeekReports, isLoading: isWeeklyReportLoading } =
    useCurrentWeekReport();
  const [show, setShow] = useState("all");
  const { data: summary, isLoading } = useReportsSummary({
    ID: user?.ID as number,
    selectedYear: new Date().getFullYear(),
  });

  const reportSummaryByMonth = useMemo(() => {
    if (isLoading || !summary) return [];

    const items =
      show !== "all"
        ? summary.filter((s) => s.unit_name === show.replace("_", " "))
        : summary;

    // 1. Collect all unique unit names (sanitized)
    const allUnits = Array.from(
      new Set(items.map((item) => item.unit_name.replace(/\s+/g, "_")))
    );

    // 2. Get current month in "Aug" format and slice MONTH_ORDER
    const currentMonthShort = new Date().toLocaleString("default", {
      month: "short",
    });
    const currentMonthIndex = MONTH_ORDER.indexOf(currentMonthShort);
    const monthsUpToNow = MONTH_ORDER.slice(0, currentMonthIndex + 1);

    // 3. Initialize map for only months up to now
    const monthMap = new Map<string, DynamicReportSummary>();
    for (const month of monthsUpToNow) {
      const entry: DynamicReportSummary = { month };
      allUnits.forEach((unit) => {
        entry[unit] = 0;
      });
      monthMap.set(month, entry);
    }

    // 4. Fill in actual report values
    for (const item of items) {
      const month = item.month;
      const unitKey = item.unit_name.replace(/\s+/g, "_");
      const monthEntry = monthMap.get(month);
      if (monthEntry) {
        monthEntry[unitKey] = item.reports;
      }
    }

    // 5. Convert to array
    return monthsUpToNow.map((month) => monthMap.get(month)!);
  }, [isLoading, summary, show]);

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
    SU_6: {
      label: "SU 6",
      color: "#581c87",
    },
    SU_7: {
      label: "SU 7",
      color: "#881337",
    },
  } satisfies ChartConfig;

  const thisWeeksReports = useMemo(() => {
    if (!thisWeekReports || thisWeekReports.length === 0) return [];

    return thisWeekReports.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [thisWeekReports]);

  return {
    reportSummaryByMonth,
    thisWeeksReports,
    show,
    setShow,
    reportsSummaryConfig,
    isLoading,
    isWeeklyReportLoading,
  };
};

export default useReportSummary;
