import { Modules } from "@/interfaces/user.interface";
import { catchError, spAPI } from "@/providers/api";
import { useLog } from "@/providers/log.provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useModules = () => {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await spAPI.get<Modules[]>("roles", {
        params: {
          modules: true,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useInsertModule = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const formdata = new FormData();
      formdata.append("name", name);
      const response = await spAPI.post(`roles`, formdata, {
        params: {
          type: "module",
        },
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(10, "modules", response.data.id, name);
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["modules"] });
    },
    onError: catchError,
  });
};

export const useToggleModule = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      module,
      status,
    }: {
      module: Modules;
      status: number;
    }) => {
      const response = await spAPI.put(`roles`, {
        type: "toggle",
        id: module.m_id,
        status,
      });
      if (response.data) {
        const t_id = status === 1 ? 14 : 13;

        if (response.data.id) {
          return await logActivity(
            t_id,
            "modules",
            response.data.id,
            module.name
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["modules"] });
    },
    onError: catchError,
  });
};
