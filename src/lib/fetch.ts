import { ChartConfig } from "@/components/ui/chart";
import { useClients } from "@/hooks/useClients";
import { useCompanies, useSalesUnits } from "@/hooks/useCompanies";
import { useSites } from "@/hooks/useSites";
import { List } from "@/interfaces";
import { Client } from "@/interfaces/client.interface";
import { User } from "@/interfaces/user.interface";
import { ChartData, SourceFilter, WidgetType } from "@/misc/dashboardLayoutMap";
import axios from "axios";
import { chartColors } from "./utils";

export async function fetchFromLark(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error_msg || JSON.stringify(result));
  }
  return result;
}
export const fetchImage: (
  imageLink: string
) => Promise<string | undefined> = async (imageLink: string) => {
  try {
    const response = await axios.get(imageLink, {
      responseType: "blob", // This ensures binary data is received
    });

    const imgUrl = URL.createObjectURL(response.data);
    return imgUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

export function findMatch<T>(
  list: T[],
  key: keyof T,
  value: string,
  normalize: (s: string) => string = (s) => s
) {
  return list.find((item) =>
    normalize(String(item[key])).match(normalize(value))
  ) as T;
}

export const useWidgetData = (
  source: string,
  filters: SourceFilter[],
  type: WidgetType
) => {
  const { data: clients } = useClients();

  if (!source || !filters || !type) return;

  switch (source.toLowerCase()) {
    case "clients":
      {
        if (!clients) return;

        const filteredClients = filterClients(clients, filters);

        if (type === "Metrics") {
          return [...new Set(filteredClients.map((c) => c.client_id))].length;
        }
      }
      break;
  }
};

const filterClients = (clients: Client[], filter: SourceFilter[]) => {
  const userData = localStorage.getItem("currentUser");
  const [ownership, status] = filter;
  if (!userData) return [];
  const user: User = JSON.parse(userData);

  const companyID = user.company?.ID ?? null;
  const salesUnitID = user.sales_unit?.sales_unit_id ?? null;
  const accountID = user.ID;

  const { value: ownVal } = ownership;
  const { value: statVal } = status;

  let filteredClients = structuredClone(clients);

  // 🔹 Ownership filter
  if (!ownVal.includes("all")) {
    filteredClients = filteredClients.filter((client) => {
      return ownVal.some((val) => {
        if (val === "company/BU") return client.company_id === companyID;
        if (val === "team") return client.sales_unit_id === salesUnitID;
        if (val === "own") return client.account_id === accountID;
        return false;
      });
    });
  }

  // 🔹 Status filter
  if (!statVal.includes("all")) {
    filteredClients = filteredClients.filter((client) => {
      return statVal.some(
        (val) => client.status_name.toLowerCase() === val.toLowerCase()
      );
    });
  }

  return filteredClients;
};

export const useOptions = (field?: string): List[] | undefined => {
  const { data: companies } = useCompanies();
  const { data: salesUnits } = useSalesUnits();

  if (!field) return;

  switch (field) {
    case "company":
      if (!companies) return;

      return companies.map((c) => {
        return {
          id: String(c.ID),
          label: c.code,
          value: String(c.ID),
        };
      });
      break;
    case "sales_unit":
      if (!salesUnits) return;

      return salesUnits.map((s) => {
        return {
          id: String(s.sales_unit_id),
          label: s.sales_unit_name,
          value: String(s.sales_unit_id),
        };
      });
  }
};

export const useData = (
  source: string,
  field: string,
  config: ChartConfig,
  map: ChartData[]
) => {
  const { data: clients } = useClients();
  const { data: sites } = useSites();

  if (source === "clients") {
    switch (field) {
      case "company":
        if (!clients) return;
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: clients.filter((client) => key.id === client.company_id)
              .length,
            fill: chartColors[index],
          };
        });
        break;
      case "sales_unit":
        if (!clients) return;
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: clients.filter((client) => key.id === client.sales_unit_id)
              .length,
            fill: chartColors[index],
          };
        });
        break;
    }
  }
};
