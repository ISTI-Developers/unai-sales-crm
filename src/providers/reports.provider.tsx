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
import { ReportTable } from "@/interfaces/reports.interface";
import { generateWeeks } from "@/data/reports.columns";
import { addHours, getISOWeek } from "date-fns";
import { VisibilityState } from "@tanstack/react-table";
// import { getISOWeekFromMonthWeek } from "@/lib/format";
import { useReportsByWeek } from "@/hooks/useReports";
import { capitalize } from "@/lib/utils";

interface Reports {
  reports: ReportTable[];
  isPending: boolean;
  filters: Conditions[];
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
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([
    getISOWeek(new Date()),
  ]);
  const [visibleWeeks, setVisibleWeeks] = useState<VisibilityState>(() => {
    const saved = localStorage.getItem("visibleWeeks");
    const currentWeekIndex = getISOWeek(new Date()) - 1; // Adjust based on your week's zero-indexing
    const currentWeekKey = weeks[currentWeekIndex]; // `week` is assumed to be the key

    let initialState: Record<string, boolean>;

    if (saved) {
      try {
        initialState = JSON.parse(saved);

        // Force the current week to be visible
        if (currentWeekKey) {
          initialState[currentWeekKey] = true;
        }
      } catch {
        // Fallback in case JSON parsing fails
        initialState = {};
      }
    } else {
      // Create new default state if no saved version exists
      initialState = weeks.reduce<Record<string, boolean>>(
        (acc, week, index) => {
          acc[week] = index === currentWeekIndex;
          return acc;
        },
        {}
      );
    }

    return initialState;
  });

  const [filters, setFilters] = useState<Conditions[]>([]);
  const { data, isPending } = useReportsByWeek(selectedWeeks);

  useEffect(() => {
    localStorage.setItem("visibleWeeks", JSON.stringify(visibleWeeks));
  }, [visibleWeeks]);

  useEffect(() => {
    // const isoWeeks = Object.entries(visibleWeeks)
    //   .filter(([, isVisible]) => isVisible)
    //   .map(([week]) => getISOWeekFromMonthWeek(week, 2025));

    const indexes = Object.entries(visibleWeeks)
      .map(([k, v], i) => ({ key: k, value: v, index: i }))
      .filter(({ value }) => value)
      .map(({ index }) => index + 1);
    setSelectedWeeks(indexes as number[]);
  }, [visibleWeeks]);

  const reports = useMemo<ReportTable[]>(() => {
    if (isPending || !data) return [];
    const statusOrder = ["HOT", "ACTIVE", "ON/OFF", "FOR ELECTIONS", "POOL"];

    const sortedReports = [...data].sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );

    const groupedClients = sortedReports.reduce<Record<string, ReportTable>>(
      (acc, item) => {
        const clientName = item.client;
        const hasDateSubmission = item.date_submitted !== null;
        const currentWeek = hasDateSubmission
          ? getISOWeek(
            new Date(
              addHours(
                new Date(item.date_submitted),
                Number(import.meta.env.VITE_TIME_ADJUST)
              )
            )
          )
          : null;

        const reportColumns: ReportTable = weeks.reduce(
          (acc, week) => {
            acc[week] = "";
            return acc;
          },
          {
            client: "",
            client_id: 0,
          } as ReportTable
        );
        const name = `${item.first_name} ${item.last_name}`;
        const userCode = `${item.first_name[0]}${item.middle_name ? item.middle_name[0] : ""
          }${item.last_name[0]}`;
        if (!acc[clientName]) {
          acc[clientName] = {
            ...reportColumns,
            client: clientName,
            client_id: item.client_id,
            sales_unit: item.sales_unit,
            status: item.status,
            sales_unit_id: item.sales_unit_id,
            account_executive: name,
            ae_code: userCode,
            account_id: item.account_id,
          };
        }
        if (hasDateSubmission) {
          const weekKey = weeks[currentWeek! - 1];
          if (weekKey && acc[clientName][weekKey] !== undefined) {
            const weekData = {
              activity: item.activity,
              reportID: item.ID,
              editorID: item.editor_id,
              editor: capitalize(item.editor),
              editorCode: item.editor_code,
              fileID: item.file_id,
              file: item.file,
            };
            acc[clientName][weekKey] = weekData;
          }
        }

        return acc;
      },
      {}
    );

    const groupedValues = Object.values(groupedClients);

    return groupedValues;
  }, [data, isPending, weeks]);

  const filteredReports = useMemo(() => {
    if (filters.length === 0) return reports;
    const weekFilters = filters.filter(
      (filter) => /Wk/.test(filter.column) && filter.condition.length !== 0
    );
    if (weekFilters.length === 0) return reports;

    return reports.filter((report) => {
      return weekFilters.every((filter) => {
        const value = report[filter.column];
        const condition = filter.condition;

        if (condition === "is empty") {
          return value === null || value === undefined || value === "";
        }

        if (condition === "is not empty") {
          return value !== null && value !== undefined && value !== "";
        }

        return true; // fallback
      });
    });
  }, [reports, filters]);
  const value = {
    reports: filteredReports,
    isPending,
    filters,
    visibleWeeks,
    setFilters,
    setVisibleWeeks,
  };

  return (
    <ReportsProviderContext.Provider value={value}>
      {children}
    </ReportsProviderContext.Provider>
  );
}
