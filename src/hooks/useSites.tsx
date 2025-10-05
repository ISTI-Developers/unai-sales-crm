import {
  City,
  AvailableSites,
  Landmarks,
  Site,
  SiteImage,
  LatestSites,
} from "@/interfaces/sites.interface";
import { catchError, getQuery, saveQuery, spAPI } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "./use-toast";

export const useSites = () => {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const sitesRes = await spAPI.get<Site[]>("sites");

      if (!Array.isArray(sitesRes.data)) {
        throw new Error("System cannot get sites from UNIS.");
      }
      return sitesRes.data;
    },
    staleTime: 60000,
  });
};

export const useSiteCities = () => {
  return useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const response = await spAPI.get<City[]>("sites", {
        params: {
          type: "areas",
        },
      });

      return response.data;
    },
    staleTime: 60000,
  });
};

export const useSitelandmarks = () => {
  return useQuery({
    queryKey: ["landmarks"],
    queryFn: async () => {
      const response = await spAPI.get<Landmarks[]>("sites", {
        params: {
          type: "landmarks",
        },
      });
      const modLms = response.data.map((lm) => {
        let types = lm.types;

        if (typeof types === "string") {
          types = types.replace("{", "");
          types = types.replace("}", "");
          types = types.split(",");
        }

        return {
          ...lm,
          types: types,
        };
      });

      return modLms;
    },
    staleTime: 60000,
  });
};

export const useSite = (id?: string) => {
  const { data, ...query } = useSites();

  return {
    data:
      id && data ? data.find((item) => item.site_code === id) ?? null : null,
    ...query,
  };
};

export const useSiteImages = (id?: string) => {
  return useQuery({
    queryKey: ["sites", "images", id],
    queryFn: async () => {
      const response = await spAPI.get<SiteImage[]>("sites", {
        params: {
          images: id,
        },
      });

      return response.data;
    },
    select: (data) =>
      data?.sort(
        (a, b) =>
          new Date(b.date_uploaded).getTime() -
          new Date(a.date_uploaded).getTime()
      ),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useAvailableSites = () => {
  const companyID = localStorage.getItem("companyID");

  return useQuery({
    queryKey: ["sites", "available"],
    queryFn: async () => {
      try {
        localStorage.setItem("cachedBookings", "false");
        const response = await spAPI.get<AvailableSites[]>("sites", {
          params: {
            type: "available",
          },
        });

        if (response.data) {
          if (!Array.isArray(response.data)) {
            throw new Error("System cannot connect to UNIS.");
          }
          const data = response.data.map((site) => {
            let rental = 0;
            if (site.net_contract_amount) {
              switch (site.payment_term_id) {
                case 1:
                  rental = site.net_contract_amount;
                  break;
                case 2:
                case 5:
                  rental = site.net_contract_amount / 12;
                  break;
                case 3:
                  rental = site.net_contract_amount / 6;
                  break;
                case 4:
                  rental = site.net_contract_amount / 3;
              }
            }
            return {
              ...site,
              site_rental: rental,
            };
          });
          await saveQuery("bookings", ["sites", "available"], data);
          return data;
        }
      } catch (error) {
        const cached = await getQuery("bookings", ["sites", "available"]);
        if (cached) {
          localStorage.setItem("cachedBookings", "true");
          return cached.data as AvailableSites[];
        } else {
          catchError(error);
          return null
        }
      }
    },
    select: (data) => data?.sort((a, b) => a.site.localeCompare(b.site)),
    throwOnError: true,
    staleTime: 60000,
    enabled: companyID ? companyID === "1" : false,
  });
};

export const useLatestSites = () => {
  return useQuery({
    queryKey: ["sites", "latest"],
    queryFn: async () => {
      try {
        const response = await spAPI.get<LatestSites[]>("sites", {
          params: {
            type: "latest",
          },
        });
        if (response.data) {
          if (!Array.isArray(response.data)) {
            throw new Error("System cannot connect to UNIS.");
          }
          return response.data;
        }
      } catch (error) {
        catchError(error);
        return null;
      }
    },
    throwOnError: true,
    staleTime: 60000,
  });
};

export const useOverrideContractEndDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      end_date: string;
      date: string;
      reason: string;
      site_code: string;
      brand: string;
    }) => {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));
      const response = await spAPI.post("sites", formdata);

      if (response.data) {
        return response.data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<AvailableSites[]>(
        ["sites", "available"],
        (prev) => {
          if (!prev) return prev;

          return prev.map((site) =>
            site.site === variables.site_code
              ? {
                ...site,
                adjusted_end_date: format(variables.date, "yyyy-MM-dd"),
                adjustment_reason: variables.reason,
              }
              : site
          );
        }
      );

      toast({
        title: "Override Success",
        description: "Contract end date has been updated successfully",
        variant: "success",
      });
    },
  });
};
export const useUpdateRemarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { site_code: string; remarks: string }) => {
      const response = await spAPI.put("sites", {
        ...data,
        type: "remarks",
      });

      if (response.data) {
        return response.data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Site[]>(["sites"], (prev) => {
        if (!prev) return prev;

        return prev.map((site) =>
          site.site_code === variables.site_code
            ? {
              ...site,
              remarks: variables.remarks,
            }
            : site
        );
      });

      toast({
        description: "Remarks updated successfully",
        variant: "success",
      });
    },
    onError: catchError,
  });
};

export const useUpdatePrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { site_code: string; priceValue: string }) => {
      const response = await spAPI.put("sites", {
        ...data,
        type: "remarks",
      });

      if (response.data) {
        return response.data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Site[]>(["sites"], (prev) => {
        if (!prev) return prev;

        return prev.map((site) =>
          site.site_code === variables.site_code
            ? {
              ...site,
              price: variables.priceValue,
            }
            : site
        );
      });

      toast({
        description: "Price updated successfully",
        variant: "success",
      });
    },
    onError: catchError,
  });
};
