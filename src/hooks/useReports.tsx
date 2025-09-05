import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ClientReport, Report } from "@/interfaces/reports.interface";
import { DefaultResponse } from "@/interfaces";
import { useAuth } from "@/providers/auth.provider";
import { catchError, spAPI } from "@/providers/api";
import { addHours, getISOWeek } from "date-fns";

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
      const response = await spAPI.get<ClientReport[]>("/reports", {
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

  const queries = useQueries({
    queries: weeks.map((week) => ({
      queryKey: ["report", new Date().getFullYear(), user?.ID, week],
      queryFn: async () => {
        const response = await spAPI.get<Report[]>("/reports", {
          params: {
            year: new Date().getFullYear(),
            week: JSON.stringify([week]),
            user: user?.ID,
          },
          onDownloadProgress: setProgress,
        });
        return response.data;
      },
      staleTime: 1000 * 60 * 10,
      enabled: !!user,
    })),
  });

  const isPending = queries.some((q) => q.isPending);
  const data = queries.flatMap((q) => q.data ?? []);

  return {
    data,
    isPending,
  };
};

export const useInsertReport = () => {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      client_id,
      sales_unit_id,
      user_id,
      date,
      report,
      file,
    }: {
      client_id: number;
      sales_unit_id: number;
      user_id: number;
      date: string;
      report: string;
      file: File | null;
    }) => {
      const formdata = new FormData();
      formdata.append("client_id", String(client_id));
      formdata.append("sales_unit_id", String(sales_unit_id));
      formdata.append("user_id", String(user_id));
      formdata.append("date", date);
      formdata.append("report", report);
      if (file) {
        formdata.append("file", file);
      }
      const response = await spAPI.post<DefaultResponse<Report>>(
        `reports`,
        formdata
      );

      return response.data;
    },
    onSuccess: (data, variables) => {
      const week = getISOWeek(variables.date);
      const report = data.item;
      queryClient.setQueryData<Report[]>(
        ["report", year, user?.ID, week],
        (old) => {
          if (!old) return old;
          const exists = old.some(
            (item) => item.client_id === variables.client_id
          );

          if (exists) {
            return old.map((item) =>
              item.client_id === variables.client_id ? (report as Report) : item
            );
          }

          return old;
        }
      );
      queryClient.refetchQueries({
        queryKey: ["report", year, user?.ID, week],
      });
      queryClient.refetchQueries({
        queryKey: ["reports", "client", variables.client_id]
      })

    },
    onError: catchError,
  });
};

export const useUpdateReport = (clientID?: number) => {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      report_id,
      user_id,
      date,
      report,
      file_path,
      file,
      file_id,
    }: {
      report_id: number;
      user_id: number;
      date: string;
      report: string;
      file_path: string;
      file: File | null;
      file_id: number;
    }) => {
      const formData = new FormData();
      formData.append("file_path", file_path);
      formData.append("report", report);
      formData.append("report_id", String(report_id));
      formData.append("user_id", String(user_id));
      formData.append("file_id", String(file_id));
      formData.append("date", date);
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
    onSuccess: (data, variables) => {
      const week = getISOWeek(variables.date);
      const report = data.item;
      queryClient.setQueryData<Report[]>(
        ["report", year, user?.ID, week],
        (old) => {
          if (!old) return old;
          const exists = old.some((item) => item.ID === variables.report_id);

          if (exists) {
            return old.map((item) =>
              item.ID === variables.report_id ? (report as Report) : item
            );
          }

          return old;
        }
      );
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
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ID }: { ID: number }) => {
      const response = await spAPI.delete<DefaultResponse<Report>>("reports", {
        params: {
          id: ID,
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      const report = data.item;
      if (!report) return;

      const week = getISOWeek(new Date(report.date_submitted));
      queryClient.setQueryData<Report[]>(
        ["report", year, user?.ID, week],
        (old) => {
          if (!old) return old;
          const exists = old.some((item) => item.ID === variables.ID);
          const blank = {
            ID: null,
            editor_id: null,
            editor: null,
            editor_code: null,
            activity: null,
            file_id: null,
            file: null,
            date_submitted: null,
          };
          if (exists) {
            return old.map((item) =>
              item.ID === variables.ID ? { ...item, ...blank } : item
            );
          }

          return old;
        }
      );
    },
    onError: catchError,
  });
};
