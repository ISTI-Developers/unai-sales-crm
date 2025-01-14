import { List, ProviderProps } from "@/interfaces";
import {
  Client,
  ClientForm,
  ClientOptions,
  ClientTypes,
  ClientUpload,
  UserClients,
} from "@/interfaces/client.interface";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProvider } from "./provider";
import { useLog } from "./log.provider";
import { User } from "@/interfaces/user.interface";

const ClientsProviderContext = createContext<ClientTypes | null>(null);

export const useClient = (): ClientTypes => {
  const context = useContext(ClientsProviderContext);

  if (context === null || context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }

  return context;
};

export function ClientProvider({ children }: ProviderProps) {
  const { authHeader, handleError, handleSessionExpiration } = useProvider();
  const { logActivity } = useLog();
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const clientURL = `${url}clients`;
  const location = useLocation();
  const currentUser = localStorage.getItem("currentUser");

  const [data, setData] = useState<Client[] | null>(null);
  const [options, setOptions] = useState<ClientOptions[] | null>(null);

  const getClients = async (id: number | null = null) => {
    try {
      const response = await axios.get(`${clientURL}${id ? `?id=${id}` : ``}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };
  const getClientsByUser = async (id: number): Promise<UserClients[]> => {
    try {
      const response = await axios.get(`${clientURL}?user=${id}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const insertClient = async (data: ClientForm) => {
    try {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));
      const response = await axios.post(`${clientURL}?type=insert`, formdata, {
        headers: authHeader(),
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(22, "clients", response.data.id, data.name);
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const updateClientStatus = async (status: List, ID: string) => {
    try {
      if (currentUser) {
        const logger: User = JSON.parse(currentUser);
        const response = await axios.put(
          `${clientURL}`,
          {
            status: status.value,
            action: "status",
            id: ID,
            logger: logger.ID,
          },
          {
            headers: authHeader(),
          }
        );
        return response.data;
      }
    } catch (error) {
      return handleError(error);
    }
  };
  const updateClient = async (data: ClientForm, ID: string) => {
    try {
      if (currentUser) {
        const logger: User = JSON.parse(currentUser);
        const response = await axios.put(
          `${clientURL}`,
          {
            data: JSON.stringify(data),
            action: "update",
            id: ID,
            logger: logger.ID,
          },
          {
            headers: authHeader(),
          }
        );
        return response.data;
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const insertBatchClients = async (data: ClientUpload[]) => {
    try {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));
      const response = await axios.post(`${clientURL}?type=batch`, formdata, {
        headers: authHeader(),
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            23,
            "clients",
            response.data.id,
            String(data.length)
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const getClientOptions = async () => {
    try {
      const response = await axios.get(clientURL + "?misc", {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const clientOptions: ClientOptions[][] = useMemo(() => {
    if (!options || typeof options === "string") return [];

    const categories = [...new Set(options.map((option) => option.category))];
    const groupedOptions = Array(categories.length).fill([]);

    categories.forEach((category, index) => {
      const filteredOptions = options.filter(
        (option) => option.category === category
      );

      groupedOptions[index] = filteredOptions;
    });

    return groupedOptions;
  }, [options]);

  useEffect(() => {
    const setup = async () => {
      if (!currentUser) return;
      let clientResponse = await getClients();

      clientResponse = handleSessionExpiration(clientResponse);

      const optResponse = await getClientOptions();
      setData(clientResponse);
      setOptions(optResponse);
    };
    setup();
  }, [url, location, clientURL, currentUser]);

  const value = {
    data,
    clientOptions,
    getClients,
    getClientsByUser,
    insertClient,
    updateClient,
    insertBatchClients,
    updateClientStatus,
  };

  return (
    <ClientsProviderContext.Provider value={value}>
      {children}
    </ClientsProviderContext.Provider>
  );
}
