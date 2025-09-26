import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ReportAccess } from "@/providers/settings.provider";
import { catchError, spAPI } from "@/providers/api";
import { Advisory } from "@/interfaces/auth.interface";
import { DefaultResponse } from "@/interfaces";
import { toast } from "./use-toast";

export const useAllReportViewAccesses = () => {
  return useQuery({
    queryKey: ["report_access"],
    queryFn: async () => {
      const response = await spAPI.get<ReportAccess[]>("/settings", {
        params: {
          report_access: true,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};
export const useUserReportViewAccesses = (id?: number) => {
  return useQuery({
    queryKey: ["report_access", id],
    queryFn: async () => {
      const response = await spAPI.get<ReportAccess[]>("/settings", {
        params: {
          report_access: true,
          id,
        },
      });
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    select: (data) => data[0],
  });
};

export interface UNISPath {
  ID: number;
  path: string;
  status: number;
}

export const useUNISURLs = () => {
  return useQuery({
    queryKey: ["unis-url"],
    queryFn: async () => {
      const response = await spAPI.get<UNISPath[]>("/settings", {
        params: {
          unis_url: true,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
export const useActiveUNISURL = () => {
  return useQuery({
    queryKey: ["unis-url", "active"],
    queryFn: async () => {
      const response = await spAPI.get<UNISPath>("/settings", {
        params: {
          unis_url: true,
          active: true
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export const useUpdateUNISURL = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UNISPath[]) => {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));
      const response = await spAPI.post<DefaultResponse>("settings", formdata, {
        params: {
          unis_url: true
        }
      });

      return response.data;
    },
    onSuccess: (data) => {
      if (data.acknowledged) {
        queryClient.refetchQueries({ queryKey: ['unis-url'] })
        queryClient.refetchQueries({ queryKey: ['unis-url', 'active'] })
        toast({
          variant: "success",
          description: "URLs updated.",
        });
      }
    },
    onError: catchError,
  });
}


export const useCreateAdvisory = () => {
  return useMutation({
    mutationFn: async (variables: Advisory) => {
      const formdata = new FormData();
      formdata.append("receipient", variables.receipient);
      formdata.append("title", variables.title);
      formdata.append("content", variables.content);
      const response = await spAPI.post<DefaultResponse>("settings", formdata);

      return response.data;
    },
    onSuccess: (data) => {
      if (data.acknowledged) {
        toast({
          variant: "success",
          description: "Advisory sent.",
        });
      }
    },
    onError: catchError,
  });
};
