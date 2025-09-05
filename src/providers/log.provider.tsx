import { DefaultResponse, ErrorResponse, ProviderProps } from "@/interfaces";
import { createContext, useContext, useEffect, useState } from "react";
import { catchError, spAPI } from "./api";

interface LogData {
  action: string;
  module: string;
  logger: string;
}
interface LogTemplate {
  ID: number;
  action: string;
}
export interface HistoryLog {
  ID: number;
  row_id: number;
  action: string;
  module: string;
  author: string;
  date: string;
}

export interface SystemLog {
  date: string;
  logs: HistoryLog[];
}

interface LogProvider {
  logs: HistoryLog[] | [];
  insertLog: (data: LogData) => Promise<DefaultResponse | null>;
  getLogTemplate: (ID: number) => Promise<LogTemplate | undefined>;
  getModuleLogs: (
    module: string,
    IDs: number[],
    modules: string[]
  ) => Promise<HistoryLog[] | null>;
  setAction: (ID: number, ...params: string[]) => Promise<string>;
  logActivity: (
    ID: number,
    module: string,
    recordID?: number | string,
    ...params: string[]
  ) => Promise<DefaultResponse>;
}
const LogsProviderContext = createContext<LogProvider | null>(null);

export const useLog = (): LogProvider => {
  const context = useContext(LogsProviderContext);
  if (context === null || context === undefined) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
};

export function LogProvider({ children }: ProviderProps) {
  const currentUser = localStorage.getItem("currentUser");

  const [logs, setLogs] = useState<HistoryLog[] | []>([]);

  const getLogTemplate = async (
    ID: number
  ): Promise<LogTemplate | undefined> => {
    try {
      const response = await spAPI.get<LogTemplate>(`logs?t_id=${ID}`);
      if (response) {
        return response.data;
      }
    } catch (error) {
      catchError(error);
    }
  };
  const getModuleLogs = async (
    module: string,
    IDs: number[],
    modules: string[]
  ) => {
    try {
      if (IDs.length === 0 || modules.length === 0) return [];

      const response = await spAPI.get(
        `logs?module=${module}&ids=${JSON.stringify(
          IDs
        )}&modules=${JSON.stringify(modules)}`
      );
      return response.data;
    } catch (error) {
      catchError(error);
    }
  };
  const insertLog = async (
    data: LogData
  ): Promise<DefaultResponse | string | ErrorResponse | null | undefined> => {
    try {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));

      const response = await spAPI.post<DefaultResponse>("logs", formdata);
      if (response) {
        return response.data;
      }

      return null;
    } catch (error) {
      catchError(error);
    }
  };

  const setAction = async (
    ID: number,
    ...params: string[]
  ): Promise<string> => {
    // Get the template asynchronously
    const template = await getLogTemplate(ID);

    if (!template) return "error";
    // Regular expression to match placeholders in the template
    const regex = /\{[^}]+\}/g;

    // Check if the template contains placeholders
    let paramIndex = 0;
    const action = template.action.replace(regex, () => {
      // Replace each placeholder with the corresponding value from params
      const replacement = params[paramIndex];
      paramIndex++;
      return replacement !== undefined ? replacement : ""; // Provide a default if params run out
    });

    return action;
  };

  const logActivity = async (
    ID: number,
    module: string,
    recordID?: number | string,
    ...params: string[]
  ) => {
    try {
      if (currentUser) {
        const logger = JSON.parse(currentUser);
        const action = await setAction(ID, ...params);

        if (action === "error") {
          return {
            acknowledged: false,
            error:
              "An error occured on logging activity. Please send a ticket to the IT.",
          };
        }
        const data = {
          action: action,
          module: module,
          logger: logger.ID,
          record_id: recordID,
        };
        const response = await insertLog(data);
        return response;
      }
    } catch (e) {
      catchError(e);
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (!currentUser) return;

      try {
        const response = await spAPI.get<HistoryLog[]>("logs");
        if (response) {
          setLogs(response.data);
        }
      } catch (error) {
        return catchError(error);
      }
    };

    setup();
  }, [currentUser]);

  const value = {
    logs,
    insertLog,
    getLogTemplate,
    getModuleLogs,
    setAction,
    logActivity,
  };

  return (
    <LogsProviderContext.Provider value={value}>
      {children}
    </LogsProviderContext.Provider>
  );
}
