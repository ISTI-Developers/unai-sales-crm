import { DefaultResponse, ErrorResponse, ProviderProps } from "@/interfaces";
import { createContext, useContext, useEffect, useState } from "react";
import { useProvider } from "./provider";
import axios from "axios";

interface Log {
  ID: number;
  action: string;
  module: string;
  logged_at: string;
  logged_by: string;
}
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
  getLogTemplate: (ID: number) => Promise<LogTemplate | null>;
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
  const { authHeader, handleError, handleSessionExpiration } = useProvider();
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const logURL = `${url}logs`;
  const currentUser = localStorage.getItem("currentUser");

  const [logs, setLogs] = useState<HistoryLog[] | []>([]);

  const getLogTemplate = async (ID: number): Promise<LogTemplate | null> => {
    try {
      const response: DefaultResponse = await axios.get(
        `${logURL}?t_id=${ID}`,
        {
          headers: authHeader(),
        }
      );
      const results: LogTemplate = handleSessionExpiration(response);
      if (results) {
        return results.data;
      }
      return null;
    } catch (error) {
      return handleError(error);
    }
  };
  const getModuleLogs = async (
    module: string,
    IDs: number[],
    modules: string[]
  ) => {
    try {
      if (IDs.length === 0 || modules.length === 0) return [];

      const response = await axios.get(
        `${logURL}?module=${module}&ids=${JSON.stringify(
          IDs
        )}&modules=${JSON.stringify(modules)}`,
        {
          headers: authHeader(),
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };
  const insertLog = async (
    data: LogData
  ): Promise<DefaultResponse | string | ErrorResponse | null | undefined> => {
    try {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));

      const response: DefaultResponse = await axios.post(logURL, formdata, {
        headers: authHeader(),
      });
      const results = handleSessionExpiration(response);
      if (results) {
        return results.data;
      }

      return null;
    } catch (error) {
      return handleError(error);
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
      return handleError(e);
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (!currentUser) {
        return;
      }

      try {
        const response: Log[] | [] = await axios.get(logURL, {
          headers: authHeader(),
        });
        const results = handleSessionExpiration(response);
        if (results) {
          setLogs(results.data);
        }
      } catch (error) {
        return handleError(error);
      }
    };

    setup();

    const interval = setInterval(setup, 60000);

    return () => clearInterval(interval);
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
