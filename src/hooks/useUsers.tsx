import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AvailableUnits,
  OnlineUser,
  User,
  UserTable,
} from "@/interfaces/user.interface";
import { catchError, spAPI } from "@/providers/api";
import { useLog } from "@/providers/log.provider";

export const useUsers = (select?: ((data: User[]) => User[]) | undefined) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await spAPI.get<User[]>("users");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    select: select,
  });
};
export const useUser = (ID: string | null) => {
  return useQuery({
    queryKey: ["users", ID],
    queryFn: async () => {
      const response = await spAPI.get<User>("users", { params: { id: ID } });
      return response.data;
    },
    enabled: !!ID,
    staleTime: 1000 * 60 * 10,
  });
};

export const useAvailableSalesUnits = () => {
  return useQuery({
    queryKey: ["users", "available"],
    queryFn: async () => {
      const response = await spAPI.get<AvailableUnits[]>("users", {
        params: { type: "available_sales_members" },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useSalesUnitMembers = (salesUnit: string | undefined) => {
  const { data } = useUsers();

  if (!data || !salesUnit) return;
  return data.filter((item) => item.sales_unit?.unit_name === salesUnit);
};

export const useOnlineUsers = () => {
  return useQuery({
    queryKey: ["online"],
    queryFn: async () => {
      const response = await spAPI.get<OnlineUser[]>("auth", {
        params: { type: "online" },
      });
      return response.data;
    },
    refetchInterval: 60000,
    staleTime: 50000
  });
};

export const useInsertUser = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      const formdata = new FormData();
      if (user.ID) {
        formdata.append("reg_id", String(user.ID));
      }
      formdata.append("user", JSON.stringify(user));

      const response = await spAPI.post("users", formdata);
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            1,
            "user_accounts",
            response.data.id,
            `${user.first_name} ${user.last_name}`
          );
        }
      }
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.refetchQueries({ queryKey: ["users", data.id] });
    },
    onError: catchError,
  });
};

export const useUpdateUser = (ID: string | null) => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      const response = await spAPI.put(
        "users",
        {
          user: user,
        },
        {
          params: {
            user_id: user.ID,
            action: "information_update",
          },
        }
      );
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            2,
            "user_accounts",
            response.data.id,
            user.first_name + " " + user.last_name
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["users"] });
      if (ID) {
        queryClient.refetchQueries({ queryKey: ["users", ID] });
      }
    },
    onError: catchError,
  });
};

export const useUpdateUserStatus = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: {
      user: UserTable;
      status: number;
    }) => {
      const response = await spAPI.put(
        "users",
        {
          role_id: status,
        },
        {
          params: {
            user_id: user.ID,
            action: "status_update",
          },
        }
      );
      if (response.data) {
        let template = 6;
        if (status === 1) {
          template = 7;
        }

        if (response.data.id) {
          return await logActivity(
            template,
            "user_accounts",
            response.data.id,
            user.user
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: catchError,
  });
};

export const useChangePassword = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      password,
    }: {
      user: User;
      password: string;
    }) => {
      try {
        const localResponse = await spAPI.put(
          `users`,
          { password: password },
          {
            params: {
              user_id: user.ID,
              action: "password_update",
            },
          }
        );

        // // External OOH API call
        // const oohResponse = await oohAPI.patch<OOHEmailValidate>(
        //   `user/password-change`,
        //   {
        //     id: sessionStorage.getItem("id"),
        //     password: password,
        //   }
        // );

        console.log("Local Response:", localResponse.data);
        // console.log("OOH Response:", oohResponse.data);

        if (localResponse.data) {
          if (localResponse.data.id) {
            return await logActivity(
              5,
              "user_accounts",
              localResponse.data.id,
              `${user.first_name} ${user.last_name}`
            );
          }
        }
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
    onError: catchError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useChangeRole = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userID,
      roleID,
      member,
      label,
    }: {
      userID: number;
      roleID: string;
      member: string;
      label: string;
    }) => {
      const response = await spAPI.put(
        `users`,
        { role: roleID },
        {
          params: {
            user_id: userID,
            action: "role_update",
          },
        }
      );

      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            3,
            "user_accounts",
            response.data.id,
            member,
            label
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: catchError,
  });
};

export const useDeleteUser = () => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserTable) => {
      const response = await spAPI.delete(`users`, {
        params: {
          id: user.ID,
        },
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            8,
            "user_accounts",
            response.data.id,
            user.user
          );
        }
      }
    },
    onError: catchError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
