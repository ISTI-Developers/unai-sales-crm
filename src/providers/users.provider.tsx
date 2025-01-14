import { ErrorResponse, ProviderProps } from "@/interfaces";
import { User, UserTable, UserTypes } from "@/interfaces/user.interface";
import axios, { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "./auth.provider";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "./log.provider";
import { useProvider } from "./provider";

const UsersProviderContext = createContext<UserTypes | null>(null);

/* eslint-disable react-refresh/only-export-components */
export const useUser = (): UserTypes => {
  const context = useContext(UsersProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a CompanyProvider");
  }

  return context;
};

export function UserProvider({ children }: ProviderProps) {
  const url = import.meta.env.VITE_LOCAL_SERVER + "users";
  const location = useLocation();
  const { logoutUser } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useLog();
  const { authHeader, handleError } = useProvider();

  const [users, setUsers] = useState<User[] | null>(null);
  const [reload, doReload] = useState<number>(0);
  //functions

  const getResponseFromUserParamType = async (
    type: string,
    id?: string,
    param_label?: string
  ) => {
    try {
      let initURL = `?type=${type}`;
      if (id) {
        initURL = initURL + `&${param_label}=${id}`;
      }
      const response = await axios.get(url + initURL, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const insertUser = async (newUser: User) => {
    try {
      const userData = new FormData();
      if (newUser.ID) {
        userData.append("reg_id", String(newUser.ID));
      }
      userData.append("user", JSON.stringify(newUser));

      const response = await axios.post(url, userData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            1,
            "user_accounts",
            response.data.id,
            `${newUser.first_name} ${newUser.last_name}`
          );
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const changePassword = async (user: User, password: string) => {
    try {
      const response = await axios.put(
        url + `?user_id=${user.ID}&action=password_update`,
        {
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            5,
            "user_accounts",
            response.data.id,
            `${user.first_name} ${user.last_name}`
          );
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const changeRole = async (
    id: string,
    user: string,
    role: string,
    name: string
  ) => {
    try {
      const response = await axios.put(
        url + `?user_id=${id}&action=role_update`,
        {
          role: role,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            3,
            "user_accounts",
            response.data.id,
            user,
            name
          );
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const updateUser = async (id: string, user: User) => {
    try {
      const response = await axios.put(
        url + `?user_id=${id}&action=information_update`,
        {
          user: user,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };
  const deleteUser = async (user: UserTable) => {
    try {
      const response = await axios.delete(url + `?id=${user.ID}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };
  const updateUserStatus = async (user: UserTable, status: number) => {
    try {
      const response = await axios.put(
        url + `?user_id=${user.ID}&action=status_update`,
        {
          role_id: status,
        },
        { headers: authHeader() }
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const forceReload = () => {
    doReload((prev) => (prev = prev + 1));
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ErrorResponse>;
          if (axiosError.response?.data) {
            return axiosError.response.data;
          }
        } else {
          // Handle unexpected errors
          console.error("Unexpected error:", error);
        }
      }
    };

    const setup = async () => {
      if (!localStorage.getItem("currentUser")) {
        return;
      }
      const response = await getUsers();
      if (response.error) {
        if (response.error.match("Expired")) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          logoutUser();
        }
      }
      setUsers(response);
    };
    setup();
  }, [location, url, reload]);

  const value: UserTypes = {
    users,
    setUsers,
    getResponseFromUserParamType,
    insertUser,
    changePassword,
    changeRole,
    forceReload,
    updateUser,
    updateUserStatus,
    deleteUser,
  };

  return (
    <UsersProviderContext.Provider value={value}>
      {children}
    </UsersProviderContext.Provider>
  );
}
