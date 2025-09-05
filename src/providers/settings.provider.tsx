/* eslint-disable react-refresh/only-export-components */
import { DefaultResponse, ProviderProps } from "@/interfaces";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth.provider";
import { catchError,spAPI } from "./api";

interface Settings {
  weekAccess: WeekAccess[];
  reload: number;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  getReportViewingAccess: (id?: number) => Promise<ReportAccess[] | false>;
  updateReportViewAccess: (
    access: string,
    id: number
  ) => Promise<DefaultResponse | false>;
  unlockWeek: (week: string) => Promise<DefaultResponse | false>;
  lockWeek: (id: number) => Promise<DefaultResponse | false>;
  doReload: Dispatch<SetStateAction<number>>;
}
export interface ReportAccess {
  ID: number;
  account_id: number;
  report_access: string | null;
}
interface WeekAccess {
  ID: number;
  week: string;
  year: number;
}
const SettingsProviderContext = createContext<Settings | null>(null);

export const useSettings = (): Settings => {
  const context = useContext(SettingsProviderContext);

  if (context === undefined || context === null) {
    throw new Error("useSettings mus be used within a SettingsProvider");
  }
  return context;
};

export function SettingsProvider({ children }: ProviderProps) {
  const { user } = useAuth();
  const [weekAccess, setWeekAccess] = useState<WeekAccess[]>([]);
  const [reload, doReload] = useState(0);
  const [isLoading, setLoading] = useState(false);

  const getWeekConfigurations = async () => {
    try {
      const response = await spAPI.get("settings?access");
      return response.data;
    } catch (error) {
      catchError(error);
    }
    return false;
  };
  const getReportViewingAccess = async (id?: number) => {
    try {
      const url = "settings?report_access" + (id ? `&id=${id}` : "");
      const response = await spAPI.get<ReportAccess[]>(url);
      return response.data;
    } catch (error) {
      catchError(error);
    }
    return false;
  };

  const updateReportViewAccess = async (access: string, id: number) => {
    try {
      const response = await spAPI.put<DefaultResponse>("settings", {
        access: access,
        user_id: id,
      });
      return response.data;
    } catch (error) {
      catchError(error);
    }
    return false;
  };
  const unlockWeek = async (week: string) => {
    try {
      const formdata = new FormData();
      formdata.append("week", week);
      const response = await spAPI.post<DefaultResponse>("settings", formdata);
      return response.data;
    } catch (error) {
      catchError(error);
    }
    return false;
  };

  const lockWeek = async (id: number) => {
    try {
      const response = await spAPI.delete<DefaultResponse>(`settings?id=${id}`);
      return response.data;
    } catch (error) {
      catchError(error);
    }
    return false;
  };

  useEffect(() => {
    if (!user) return;
    const setup = async () => {
      const response = await getWeekConfigurations();
      setWeekAccess(response);
    };
    setup();
  }, [user, reload]);

  const value = {
    reload,
    isLoading,
    weekAccess,
    doReload,
    setLoading,
    getReportViewingAccess,
    updateReportViewAccess,
    unlockWeek,
    lockWeek,
  };
  return (
    <SettingsProviderContext.Provider value={value}>
      {children}
    </SettingsProviderContext.Provider>
  );
}
