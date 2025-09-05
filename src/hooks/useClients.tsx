import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Client,
  ClientInformation,
  ClientUpload,
} from "@/interfaces/client.interface";
import { Access, DefaultResponse } from "@/interfaces";

import { useMemo } from "react";
import { catchError, spAPI } from "@/providers/api";
import { useAuth } from "@/providers/auth.provider";

export const useClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await spAPI.get<Client[]>("clients");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useClient = (id: string | null) => {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const response = await spAPI.get<ClientInformation>(`clients?id=${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateClient = <TData = unknown>() => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TData) => {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));

      const response = await spAPI.post(`clients?type=insert`, formdata);

      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["clients"] });
    },
    onError: catchError,
  });
};

export const useBatchInsertClients = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClientUpload[]) => {
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));

      const response = await spAPI.post(`clients?type=batch`, formdata);

      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["clients"] });
    },
    onError: catchError,
  });
};

export const useUpdateClient = <TData = unknown>(ID: string | null) => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TData) => {
      if (!user) {
        throw new Error("User not found");
      }
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));

      const response = await spAPI.put<DefaultResponse>(`clients`, {
        data: JSON.stringify(data),
        action: "update",
        id: ID,
        logger: user.ID,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["clients"] });
      queryClient.refetchQueries({ queryKey: ["clients", ID] });
    },
    onError: catchError,
  });
};

export const useUpdateClientStatus = () => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ status, ID }: { status: string; ID: string }) => {
      if (!user) {
        throw new Error("User not found.");
      }
      const response = await spAPI.put<DefaultResponse>("clients", {
        status: status,
        action: "status",
        id: ID,
        logger: user.ID,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["clients"] });
    },
    onError: catchError,
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ID }: { ID: number }) => {
      const response = await spAPI.delete<DefaultResponse>("clients", {
        params: {
          id: ID,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["clients"] });
    },
    onError: catchError,
  });
};

export const useClientAccess = (id: number | null = null) => {
  const { user } = useAuth();
  const access: Access = useMemo(() => {
    const defaultAccess = {
      view: true,
      add: false,
      edit: false,
      delete: false,
    };
    if (!user) return defaultAccess;

    const roleAccesses = user.role.access.find((role) => role.m_id === id);

    if (!roleAccesses) return defaultAccess;

    const permissions = roleAccesses.permissions;

    return {
      view: Boolean(permissions[0]),
      add: Boolean(permissions[1]),
      edit: Boolean(permissions[2]),
      delete: Boolean(permissions[3]),
    };
  }, [user]);

  return { access };
};
