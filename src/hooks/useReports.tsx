import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Activity, Report } from "@/interfaces/reports.interface";
import { DefaultResponse } from "@/interfaces";
import { useAuth } from "@/providers/auth.provider";
import { catchError, spAPI } from "@/providers/api";
import { addHours } from "date-fns";

export const useReports = () => {
  const { user } = useAuth();

  const year = new Date().getFullYear();
  return useQuery({
    queryKey: ["reports", year, user?.ID],
    queryFn: async () => {
      const response = await spAPI.get<Report[]>("/reports", {
        params: {
          year: year,
          user: user?.ID,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!year && !!user,
  });
};
export const useClientReports = (clientID?: number) => {
  return useQuery({
    queryKey: ["reports", "client", clientID],
    queryFn: async () => {
      const response = await spAPI.get<Activity[]>("/reports", {
        params: {
          client_id: clientID,
        },
      });
      return response.data;
    },
    select: (data) => {
      if (!data) return [];

      return data.map(item => {
        return {
          ...item,
          date_modified: addHours(new Date(item.date_modified), import.meta.env.VITE_TIME_ADJUST),
          date_submitted: addHours(new Date(item.date_submitted), import.meta.env.VITE_TIME_ADJUST)
        }
      })
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!clientID,
  });
};

export const useReportsByWeek = (weeks: number[]) => {
  const { user } = useAuth();
  const { setProgress } = useAuth();

  return useQuery({
    queryKey: ["reports", new Date().getFullYear(), user?.ID, weeks],
    queryFn: async () => {
      const response = await spAPI.get<Report[]>("/reports", {
        params: {
          year: new Date().getFullYear(),
          week: JSON.stringify(weeks),
          user: user?.ID,
        },
        onDownloadProgress: setProgress,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!user,
  });
};

export const useInsertReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ activity, file }: { activity: Pick<Activity, "client_id" | "activity" | "date_submitted" | "tags">; file: File | null }) => {
      const formdata = new FormData();
      formdata.append("client_id", String(activity.client_id));
      formdata.append("date_submitted", activity.date_submitted.toISOString());
      formdata.append("activity", activity.activity);
      formdata.append("tags", JSON.stringify(activity.tags));
      if (file) {
        formdata.append("file", file);
      }
      const response = await spAPI.post<DefaultResponse<Report>>(
        `reports`,
        formdata
      );

      return response.data;
    },
    onSuccess: (_, { activity }) => {
      queryClient.refetchQueries({
        queryKey: ["reports", "client", activity.client_id]
      })

    },
    onError: catchError,
  });
};

export const useUpdateReport = (clientID?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ activity, file }: { activity: Pick<Activity, "ID" | "file" | "file_id" | "activity" | "tags">; file: File | null }) => {
      const formData = new FormData();
      formData.append("file_path", activity.file ?? "");
      formData.append("activity", activity.activity);
      formData.append("tags", JSON.stringify(activity.tags ?? []));
      formData.append("report_id", String(activity.ID));
      formData.append("file_id", String(activity.file_id));
      formData.append("PUT", "PUT");
      if (file) {
        formData.append("file", file);
      }
      const response = await spAPI.post<DefaultResponse<Report>>(
        `reports`,
        formData
      );

      return response.data;
    },
    onSuccess: () => {
      if (clientID) {
        queryClient.refetchQueries({
          queryKey: ["reports", "client", clientID],
        })
      }
    },
    onError: catchError,
  });
};

export const useDeleteReport = () => {
  return useMutation({
    mutationFn: async ({ ID }: { ID: number }) => {
      const response = await spAPI.delete<DefaultResponse<Report>>("reports", {
        params: {
          id: ID,
        },
      });
      return response.data;
    },
    onError: catchError,
  });
};
