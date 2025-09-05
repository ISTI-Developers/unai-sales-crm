import { useMutation, useQuery } from "@tanstack/react-query";

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
