import { Role } from "@/interfaces/user.interface";
import { catchError, spAPI } from "@/providers/api";
import { useLog } from "@/providers/log.provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await spAPI.get<Role[]>("roles");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useRole = (ID: string | null) => {
  return useQuery({
    queryKey: ["roles", ID],
    queryFn: async () => {
      const response = await spAPI.get<Role>("roles", {
        params: {
          id: ID,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!ID,
  });
};

export const useUserRole = (ID: string | number | null) => {
  return useQuery({
    queryKey: ["roles", ID],
    queryFn: async () => {
      const response = await spAPI.get<Role>("roles", {
        params: {
          user_id: ID,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!ID,
  });
};

export const useInsertRole = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role: Role) => {
      const formdata = new FormData();
      formdata.append("role", JSON.stringify(role));
      const response = await spAPI.post(`roles`, formdata, {
        params: {
          type: "role",
        },
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            9,
            "user_roles",
            response.data.id,
            role.name
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["roles"] });
    },
    onError: catchError,
  });
};

export const useUpdaterolePermissions = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role: Role) => {
      const response = await spAPI.put(`roles`, {
        type: "update",
        ...role,
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            15,
            "user_roles",
            response.data.id,
            role.name
          );
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ["roles"] });
      queryClient.refetchQueries({ queryKey: ["roles", variables.role_id] });
    },
    onError: catchError,
  });
};

export const useManageRole = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ role, status }: { role: Role; status: number }) => {
      const response = await spAPI.put(`roles`, {
        type: "manage",
        id: role.role_id,
        status: status,
      });
      if (response.data) {
        const t_id = status === 1 ? 12 : status === 2 ? 11 : 16;
        if (response.data.id) {
          return await logActivity(
            t_id,
            "user_roles",
            response.data.id,
            role.name
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["roles"] });
    },
    onError: catchError,
  });
};
