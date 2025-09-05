import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Company, newCompanyProps } from "@/interfaces/company.interface";
import { SalesGroup } from "@/interfaces/user.interface";
import { useLog } from "@/providers/log.provider";
import { catchError, spAPI } from "@/providers/api";

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await spAPI.get<Company[]>("companies");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCompany = (id?: number) => {
  const { data: salesUnits } = useSalesUnits();

  return useQuery({
    queryKey: ["companies", id],
    queryFn: async () => {
      const response = await spAPI.get<Company>("companies", {
        params: {
          id: id,
        },
      });
      if (response.data) {
        if (salesUnits) {
          return {
            ...response.data,
            units: [...salesUnits.filter((unit) => unit.company_id === id)],
          };
        }
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSalesUnits = () => {
  return useQuery({
    queryKey: ["sales_units"],
    queryFn: async () => {
      const response = await spAPI.get<SalesGroup[]>(
        "companies?sales_units_summary"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useInsertCompany = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCompany: newCompanyProps) => {
      const companyData = new FormData();
      companyData.append("code", newCompany.code);
      companyData.append("name", newCompany.name);
      companyData.append("sales_units", JSON.stringify(newCompany.sales_units));

      const response = await spAPI.post("companies", companyData);
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            17,
            "companies",
            response.data.id,
            newCompany.name
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["sales_units"] });
    },
    onError: catchError,
  });
};

export const useUpdateCompany = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newCompany,
    }: {
      id: number | string;
      newCompany: newCompanyProps;
    }) => {
      const response = await spAPI.put(`companies?id=${id}`, newCompany);
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            18,
            "companies",
            response.data.id,
            newCompany.name
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["sales_units"] });
    },
    onError: catchError,
  });
};

export const useCompanySalesUnits = (company: string | undefined) => {
  const { data } = useSalesUnits();
  const { data: companies } = useCompanies();

  if (!data || !companies || !company) return;
  const selectedCompany = companies.find((item) => item.name === company);
  return selectedCompany
    ? data.filter((item) => item.company_id === selectedCompany.ID)
    : undefined;
};
