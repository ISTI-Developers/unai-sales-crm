import { ChartConfig } from "@/components/ui/chart";
import { useClients } from "@/hooks/useClients";
import { useCompanies, useSalesUnits } from "@/hooks/useCompanies";
// import { useSites } from "@/hooks/useSites";
import { List } from "@/interfaces";
import { Client } from "@/interfaces/client.interface";
import { User } from "@/interfaces/user.interface";
import { ChartData, SourceFilter, WidgetType } from "@/misc/dashboardLayoutMap";
import axios from "axios";
import { chartColors } from "./utils";
import { useStatuses } from "@/hooks/useClientOptions";
import { useAvailableSites, useSites } from "@/hooks/useSites";
import { Booking, useBookings } from "@/hooks/useBookings";
import { differenceInDays } from "date-fns";
import { AvailableSites, Site } from "@/interfaces/sites.interface";
import { useCurrentWeekReport } from "@/hooks/useDashboard";

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

    const blob = response.data;

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
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
  const { data: sites } = useSites();
  const { data: availability = [] } = useAvailableSites();
  const { data: bookings } = useBookings();
  const { data: reports } = useCurrentWeekReport();

  if (!source || !filters || !type) return;

  switch (source.toLowerCase()) {
    case "clients": {
      if (!clients) return;

      const filteredClients = filterClients(clients, filters);

      return [...new Set(filteredClients.map((c) => c.client_id))].length;
      // if (type === "Metrics") {
      // }
    }
    case "sites":
      {
        if (!sites || !availability || !bookings) return;
        const [siteFilter] = filters;
        const { value } = siteFilter;
        const processedSites = processSites(sites, availability, bookings);

        if (type === "Metrics") {
          const counts = {
            active: processedSites.filter((s) => s?.status === 1).length,
            inactive: processedSites.filter((s) => s?.status === 0).length,
            available: processedSites.filter((s) => s?.available === 1).length,
            booked: processedSites.filter((s) => s?.available === 0).length,
          };

          return (
            counts[value[0] as keyof typeof counts] ?? processedSites.length
          );
        } else {
          return processedSites;
        }
      }
      break;
    case "reports": {
      if (!reports) return;

      return reports.length;
      return 10;
    }
  }
};

export const useOptions = (
  module: string,
  field?: string
): List[] | undefined => {
  const { data: companies } = useCompanies();
  const { data: salesUnits } = useSalesUnits();
  const { data: clients } = useClients();
  const { data: statuses } = useStatuses();

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
    case "account_executive": {
      if (!clients) return;

      const accounts = [...new Set(clients.map((client) => client.account_id))];

      return accounts.map((account) => {
        return {
          id: String(account),
          label:
            clients.find((client) => client.account_id === account)
              ?.account_executive ?? "",
          value: String(account),
        };
      });
    }
    case "status": {
      if (!statuses) return;
      if (module === "sites") {
        return [
          { id: "1", label: "Active", value: "1" },
          { id: "0", label: "Inactive", value: "0" },
        ];
      }
      return statuses.map((status) => {
        return {
          id: String(status.misc_id),
          label: status.name,
          value: String(status.misc_id),
        };
      });
    }
    case "availability": {
      return [
        { id: "1", label: "Available", value: "1" },
        { id: "0", label: "Booked", value: "0" },
      ];
    }
  }
};
// or random but stable using index as seed
const getRandomColorForIndex = (index: number) => {
  const seed = (index * 9301 + 49297) % 233280; // simple LCG
  const rnd = seed / 233280;
  return chartColors[Math.floor(rnd * chartColors.length)];
};
export const useData = (
  source: string,
  field: string,
  config: ChartConfig,
  map: ChartData[]
) => {
  const { data: clients } = useClients();
  const data = useWidgetData(
    "sites",
    [{ key: "options", value: ["all sites"] }],
    "Pie"
  );
  if (source === "clients") {
    if (!clients) return;
    switch (field) {
      case "company":
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: clients.filter((client) => key.id === client.company_id)
              .length,
            fill: getRandomColorForIndex(index),
          };
        });
      case "sales_unit":
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: clients.filter((client) => key.id === client.sales_unit_id)
              .length,
            fill: getRandomColorForIndex(index),
          };
        });
      case "account_executive":
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: clients.filter((client) => key.id === client.account_id)
              .length,
            fill: getRandomColorForIndex(index),
          };
        });
      case "status":
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: clients.filter((client) => key.id === client.status).length,
            fill: getRandomColorForIndex(index),
          };
        });
    }
  }
  if (source === "sites") {
    if (!data || !Array.isArray(data)) return;
    switch (field) {
      case "status":
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: data.filter((d) => key.id === d?.status).length,
            fill: getRandomColorForIndex(index),
          };
        });
      case "availability":
        return map.map((key, index) => {
          const label = config[key.key].label ?? "";
          return {
            label: String(label),
            count: data.filter((d) => key.id === d?.available).length,
            fill: getRandomColorForIndex(index),
          };
        });
    }
  }
};

//helpers

const processSites = (
  sites: Site[],
  availability: AvailableSites[],
  bookings: Booking[]
) => {
  const today = new Date();

  // helpers
  const getActiveBooking = (siteCode: string) =>
    bookings.find(
      (booking) =>
        booking.site_code === siteCode &&
        new Date(booking.date_from) <= today &&
        booking.booking_status !== "CANCELLED"
    );

  const calculateEndDate = (site: AvailableSites) => {
    const activeBooking = getActiveBooking(site.site);

    if (activeBooking) {
      if (site.adjusted_end_date) {
        return new Date(activeBooking.date_from) <
          new Date(site.adjusted_end_date)
          ? activeBooking.date_from
          : site.adjusted_end_date;
      }
      return activeBooking.date_to;
    }

    return site.adjusted_end_date ?? site.end_date;
  };

  const toProcessedSite = (
    site: Site,
    overrides: Partial<{
      site_code: string;
      available: number;
      region: string;
      area: string;
      status: number | string;
      site_owner: string;
    }> = {}
  ) => ({
    site_code: site.site_code,
    region: site.region,
    area: site.city,
    available: 0,
    status: site.status,
    site_owner: site.site_owner,
    ...overrides,
  });

  // compute sets
  const availableSites = new Set(availability.map((s) => s.site));

  const availableByDefault = sites.filter(
    (site) => !availableSites.has(site.site_code)
  );

  const availableByBooking = availability.map((site) => {
    const endDate = calculateEndDate(site);
    return {
      ...site,
      end_date: endDate,
      remaining_days: endDate ? differenceInDays(new Date(endDate), today) : 0,
      days_vacant: endDate ? differenceInDays(today, new Date(endDate)) : 0,
    };
  });

  // process default sites
  const processedSiteDefault = availableByDefault.map((site) =>
    toProcessedSite(site, { available: 1 })
  );

  const processedSiteBooking = availableByBooking
    .map((site) => {
      const item = sites.find((s) => s.site_code === site.site);
      if (!item) return null; // skip if site not in filteredSites

      return toProcessedSite(item, {
        site_code: site.site,
        available: site.remaining_days <= 60 ? 1 : 0,
        status: item.status,
        site_owner: item.site_owner,
      });
    })
    .filter(Boolean); // remove nulls

  const mergedSites = [...processedSiteBooking, ...processedSiteDefault];

  // keep last occurrence if duplicates
  const uniqueSites = Array.from(
    new Map(mergedSites.map((site) => [site?.site_code, site])).values()
  );

  return uniqueSites;
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

  let filteredClients = structuredClone(clients);

  // 🔹 Ownership filter
  if (!ownVal.some((val) => val.includes("all"))) {
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
  if (status) {
    const { value: statVal } = status;
    if (!statVal.some((val) => val.includes("all"))) {
      filteredClients = filteredClients.filter((client) => {
        return statVal.some(
          (val) => client.status_name.toLowerCase() === val.toLowerCase()
        );
      });
    }
  }

  if (![1].includes(user.role.role_id)) {
    return filteredClients.filter((client) => client.company_id === companyID);
  }

  return filteredClients;
};
