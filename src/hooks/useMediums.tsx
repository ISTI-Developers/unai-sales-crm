import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Medium,
  MediumCompany,
  MediumWithCompanies,
  MediumWithUpdate,
} from "@/interfaces/mediums.interface";

import { DefaultResponse } from "@/interfaces";
import { useAuth } from "@/providers/auth.provider";
import { catchError, spAPI } from "@/providers/api";

export const useMediums = () => {
  return useQuery({
    queryKey: ["mediums"],
    queryFn: async () => {
      const response = await spAPI.get<Medium[]>("/mediums");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCompanyMediums = () => {
  return useQuery({
    queryKey: ["mediums", "with-company"],
    queryFn: async () => {
      const response = await spAPI.get<MediumWithCompanies[]>(
        `/mediums?with=companies`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useInsertMedium = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MediumCompany[]) => {
      if (!user) {
        throw new Error("User not found.");
      }
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));
      formdata.append("id", String(user.ID));

      const response = await spAPI.post<DefaultResponse>(
        `mediums?type=insert`,
        formdata
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["mediums"] });
    },
    onError: catchError,
  });
};

export const useUpdateMedium = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MediumWithUpdate) => {
      if (!user) {
        throw new Error("User not found.");
      }

      const response = await spAPI.put<DefaultResponse>(`mediums?type=update`, {
        data: JSON.stringify(data),
        id: user.ID,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["mediums"] });
    },
    onError: catchError,
  });
};

export const useDeleteMediumm = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!user) {
        throw new Error("User not found.");
      }
      const response = await spAPI.delete<DefaultResponse>(
        `mediums?id=${id}&user_id=${user.ID}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["mediums"] });
    },
    onError: catchError,
  });
};
