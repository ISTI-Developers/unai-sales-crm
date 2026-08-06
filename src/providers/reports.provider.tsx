import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { List, ProviderProps } from "@/interfaces";
import { Activity, ReportTable, WeekColumns } from "@/interfaces/reports.interface";
import { getISOWeek } from "date-fns";
import { VisibilityState } from "@tanstack/react-table";
import { useReportsByWeek } from "@/hooks/useReports";
import { generateWeeks } from "@/lib/utils";

interface SheetData {
  client: ReportTable;
  columnID: string;
}
interface Reports {
  reports: ReportTable[];
  isPending: boolean;
  filters: Conditions[];
  selectedWeeks: number[];
  sheetOpen: boolean;
  sheetData?: SheetData;
  setSheetOpen: Dispatch<SetStateAction<boolean>>;
  openReportSheet: (data: SheetData) => void;
  setFilters: Dispatch<SetStateAction<Conditions[]>>;
  visibleWeeks: VisibilityState;
  setVisibleWeeks: Dispatch<SetStateAction<VisibilityState>>;
}

export type ConditionOptions =
  | "is"
  | "is not"
  | "contains"
  | "does not contain"
  | "is empty"
  | "is not empty";

export interface Conditions {
  id: string;
  column: string;
  condition: ConditionOptions | string;
  query: string | List[];
}
const ReportsProviderContext = createContext<Reports | null>(null);

export const useReports = (): Reports => {
  const context = useContext(ReportsProviderContext);

  if (context === undefined || context === null) {
    throw new Error("useReports must be used within a ReportProvider");
  }
  return context;
};

export function ReportProvider({ children }: ProviderProps) {
  const weeks = useMemo(() => generateWeeks(), []);
  const weekMap = useMemo(() => {
    return new Map(weeks.map(week => ([String(week.yearweek), week])))
  }, [weeks])
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([
    getISOWeek(new Date()),
  ]);
  const [visibleWeeks, setVisibleWeeks] = useState<VisibilityState>(() => {
    const saved = localStorage.getItem("visibleWeeks");
    const currentWeek = weeks.find((week) => week.isCurrent);

    let savedState: VisibilityState = {};

    if (saved) {
      try {
        savedState = JSON.parse(saved);
      } catch {
        savedState = {};
      }
    }

    const initialState = weeks.reduce<Record<string, boolean>>((acc, week) => {
      const key = String(week.yearweek);

      // Use saved value if exists, otherwise hide it
      acc[key] = savedState[key] ?? false;

      return acc;
    }, {});

    // Always force current week visible
    if (currentWeek) {
      initialState[String(currentWeek.yearweek)] = true;
    }

    return initialState;
  });

  const [filters, setFilters] = useState<Conditions[]>([]);
  const { data, isPending } = useReportsByWeek(selectedWeeks);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState<SheetData>();

  const openReportSheet = (data: typeof sheetData) => {
    if (!data) return;

    setSheetData(data);

    // Only open if closed
    if (!sheetOpen) {
      setSheetOpen(true);
    }
  };

  useEffect(() => {
    localStorage.setItem("visibleWeeks", JSON.stringify(visibleWeeks));
  }, [visibleWeeks]);

  useEffect(() => {
    const indexes = Object.entries(visibleWeeks)
      .map(([k, v], i) => ({ key: k, value: v, index: i }))
      .filter(({ value }) => value)
      .map((week) => weekMap.get(week.key)!.isoWeek);
    setSelectedWeeks(indexes);
  }, [visibleWeeks, weekMap]);

  const reports = useMemo<ReportTable[]>(() => {
    if (isPending || !data) return [];
    const statusOrder = ["HOT", "ACTIVE", "ON/OFF", "POOL"];


    const sortedClients = [...data].sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );

    const processedClients = sortedClients.map((item) => {
      const columns = weeks.reduce<Record<number, Activity[] | "">>(
        (acc, week) => {
          acc[week.yearweek] = "";
          return acc;
        },
        {} as WeekColumns
      );

      // Populate the weeks that have reports
      for (const [yearweek, reports] of Object.entries(item.reports)) {
        columns[Number(yearweek)] = reports;
      }

      return {
        ...item,
        ...columns,
      };
    });

    processedClients.sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );

    return processedClients;
  }, [data, isPending, weeks]);


  const value = {
    reports,
    isPending,
    filters,
    visibleWeeks,
    selectedWeeks,
    sheetOpen,
    sheetData,
    openReportSheet,
    setSheetOpen,
    setFilters,
    setVisibleWeeks,
  };

  return (
    <ReportsProviderContext.Provider value={value}>
      {children}
    </ReportsProviderContext.Provider>
  );
}
