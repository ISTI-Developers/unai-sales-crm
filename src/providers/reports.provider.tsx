import { DefaultResponse, ErrorResponse, ProviderProps } from "@/interfaces";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProvider } from "./provider";
import { Report, ReportsContext } from "@/interfaces/reports.interface";
import { useRole } from "./role.provider";
import { User } from "@/interfaces/user.interface";

const ReportsProviderContext = createContext<ReportsContext | null>(null);

export const useReports = (): ReportsContext => {
  const context = useContext(ReportsProviderContext);

  if (context === null || context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};

export function ReportProvider({ children }: ProviderProps) {
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const { pathname } = useLocation();
  const { authHeader, handleError } = useProvider();
  const user = localStorage.getItem("currentUser");
  const { getPermission, currentUserRole } = useRole();

  const [reports, setReports] = useState<Report[] | null>(null);

  const insertReport = async (
    client_id: number,
    sales_unit_id: number,
    user_id: number,
    date: string,
    report: string
  ): Promise<DefaultResponse | string | ErrorResponse | undefined> => {
    try {
      const formdata = new FormData();
      formdata.append("client_id", String(client_id));
      formdata.append("sales_unit_id", String(sales_unit_id));
      formdata.append("user_id", String(user_id));
      formdata.append("date", date);
      formdata.append("report", report);
      const response = await axios.post(`${url}reports`, formdata, {
        headers: authHeader(),
      });
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      return handleError(error);
    }
  };

  useEffect(() => {
    if (!user || !pathname.includes("reports")) return;
    const currentUser: User = JSON.parse(user);

    const setup = async () => {
      const response = await axios.get(`${url}reports`, {
        headers: authHeader(),
      });
      if (Array.isArray(response.data)) {
        const reports = response.data.filter((report: Report) => {
          switch (currentUserRole?.role_id) {
            case 1:
            case 3:
              return report;
            case 4:
              return report.sales_unit_id === currentUser.sales_unit?.sales_unit_id;
            case 5:
              return report.account_id === currentUser.ID;
            default:
              return report;
          }
        });
        setReports(reports);
      }
    };
    setup();
  }, [user, pathname, currentUserRole]);

  const value = {
    reports,
    insertReport,
  };

  return (
    <ReportsProviderContext.Provider value={value}>
      {children}
    </ReportsProviderContext.Provider>
  );
}
