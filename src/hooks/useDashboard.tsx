import { useQuery } from "@tanstack/react-query";
import {
  ReportSummary,
  WeeklyReportSummary,
} from "@/interfaces/reports.interface";
import { StatusSummary } from "@/data/clientSummary.data";

import {
  CircleCheck,
  CircleSlash2,
  Flame,
  GitCompare,
  Landmark,
} from "lucide-react";
import { customOrder } from "@/lib/utils";
import { useAuth } from "@/providers/auth.provider";
import { spAPI } from "@/providers/api";

export const useReportsSummary = ({
  ID,
  selectedYear,
}: {
  ID?: number;
  selectedYear?: number;
}) => {
  return useQuery({
    queryKey: ["dashboard", "report", ID],
    queryFn: async () => {
      const response = await spAPI.get<ReportSummary[]>(`reports`, {
        params: {
          summary: true,
          user: ID,
          year: selectedYear,
        },
      });
      return response.data;
    },
    enabled: !!ID && !!selectedYear,
    staleTime: 1000 * 60 * 10,
  });
};
export const useCurrentWeekReport = () => {
  return useQuery({
    queryKey: ["dashboard", "report-week"],
    queryFn: async () => {
      const response = await spAPI.get<WeeklyReportSummary[]>(
        `reports?this_week`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export type Status = string;
export type SalesUnit = string;

export interface RawData {
  salesUnit: SalesUnit;
  status: Status;
  clients: number;
}

export const useClientDistribution = (unit_id?: number) => {
  return useQuery({
    queryKey: ["dashboard", "by-unit", unit_id],
    queryFn: async () => {
      const response = await spAPI.get<RawData[]>(`clients?by_unit`, {
        params: {
          unit_id: unit_id,
        },
      });
      return response.data;
    },
    select: (data) => {
      return data.map((item) => {
        return {
          ...item,
          salesUnit: item.salesUnit.split(" ").join(""),
          status: item.status
            .split(" ")
            .join("")
            .split("/")
            .join("")
            .toLowerCase(),
        };
      });
    },
    staleTime: 1000 * 60 * 10,
  });
};
export const useReportsTrend = () => {
  return useQuery({
    queryKey: ["dashboard", "activity-trend"],
    queryFn: async () => {
      const response = await spAPI.get<
        {
          week: number;
          total_records: number;
        }[]
      >(`settings?trend`);
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};
export const useClientStatusSummary = (status?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "report-status", user?.ID],
    queryFn: async () => {
      const [total, pool] = await Promise.all([
        spAPI.get<StatusSummary[]>(
          `reports?count=${user?.sales_unit?.sales_unit_id ?? 0}`
        ),
        spAPI.get<StatusSummary[]>(
          `reports?count=${user?.sales_unit?.sales_unit_id ?? 0}${
            status ? `&status=${status}` : ""
          }`
        ),
      ]);

      if (!total.data || !pool.data) return null;

      const totalData = total.data
        .map((item) => {
          return {
            ...item,
            key:
              item.status === "ON/OFF"
                ? "onOff"
                : item.status === "FOR ELECTIONS"
                ? "forElections"
                : item.status.toLowerCase(),
            icon:
              item.status === "HOT"
                ? Flame
                : item.status === "ACTIVE"
                ? CircleCheck
                : item.status === "ON/OFF"
                ? GitCompare
                : item.status === "FOR ELECTIONS"
                ? Landmark
                : CircleSlash2,
            width: ["ACTIVE", "HOT", "ON/OFF"].includes(item.status)
              ? "lg:w-[calc(100%/3-2rem/3)]"
              : "lg:w-[calc(50%-0.5rem)]",
            color:
              item.status === "HOT"
                ? `bg-gradient-to-tr from-orange-600 to-yellow-300 text-yellow-200`
                : item.status === "ACTIVE"
                ? `bg-gradient-to-tr from-green-700 to-green-300 text-green-200`
                : item.status === "ON/OFF"
                ? `bg-gradient-to-tr from-blue-700 to-sky-300 text-sky-100`
                : item.status === "FOR ELECTIONS"
                ? `bg-gradient-to-tr from-violet-700 to-violet-300 text-violet-100`
                : `bg-gradient-to-tr from-slate-700 to-slate-300 text-slate-100`,
          };
        })
        .sort((a, b) => {
          return customOrder.indexOf(a.status) - customOrder.indexOf(b.status);
        });
      return {
        total: totalData,
        pool: pool.data,
      };
    },
    enabled: !!user,
    staleTime: 60000,
  });
};
