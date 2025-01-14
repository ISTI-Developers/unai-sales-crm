import { DefaultResponse, ErrorResponse, ProviderProps } from "@/interfaces";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProvider } from "./provider";
import { Report, ReportsContext } from "@/interfaces/reports.interface";

const ReportsProviderContext = createContext<ReportsContext | null>(null);

export const useReports = (): ReportsContext => {
  const context = useContext(ReportsProviderContext);

  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};

export function ReportProvider({ children }: ProviderProps) {
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const { pathname } = useLocation();
  const { authHeader, handleError } = useProvider();
  const user = localStorage.getItem("currentUser");

  const [reports, setReports] = useState<Report[] | null>(null);

  const insertReport = async (
    client_id: number,
    date: string,
    report: string
  ): Promise<DefaultResponse | string | ErrorResponse | undefined> => {
    try {
      const formdata = new FormData();
      formdata.append("client_id", String(client_id));
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

    const setup = async () => {
      const response = await axios.get(`${url}reports`, {
        headers: authHeader(),
      });
      if (Array.isArray(response.data)) {
        setReports(response.data);
      }
    };
    setup();
  }, [user, pathname]);

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
