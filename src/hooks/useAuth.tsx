import { DefaultResponse } from "@/interfaces";
import { PasswordResetData } from "@/interfaces/auth.interface";
import { User, UserTable } from "@/interfaces/user.interface";
import { generatePassword } from "@/lib/utils";
import { catchError, spAPI } from "@/providers/api";
import { useAuth } from "@/providers/auth.provider";
import { useLog } from "@/providers/log.provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Credentials {
  username: string;
  password: string;
}

// interface OOHResponse {
//   id: string;
//   first_name: string;
//   last_name: string;
//   username: string;
//   email_address: string;
//   role_id: string;
//   token: string;
// }
interface OOHEmailSuccess {
  success: true;
  user_id: string;
}

interface OOHEmailError {
  success: false;
  error_message: string;
}

export type OOHEmailValidate = OOHEmailSuccess | OOHEmailError;

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async ({ username, password }: Credentials) => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      try {
        // Local API call
        const localResponse = await spAPI.post<User>("auth", formData, {
          params: { type: "login" },
        });
        console.log("Local Response:", localResponse.data);
    
        return {
          local: localResponse.data,
        };
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.local) {
        setUser(data.local);
        // localStorage.setItem("OOHToken", data.ooh.token);
        // localStorage.setItem("OOHID", data.ooh.id);
        localStorage.setItem("currentUser", JSON.stringify(data.local));
        sessionStorage.setItem("loginTime", String(new Date().getTime()));
        if (data.local.token) {
          localStorage.setItem("token", data.local.token);
        }
        if (localStorage.getItem("last_location") !== null) {
          navigate(String(localStorage.getItem("last_location")));
        } else {
          navigate("/");
        }
      }
    },
    onError: catchError,
  });
};

export const usePasswordReset = (ID: number) => {
  const { logActivity } = useLog();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: UserTable) => {
      const formdata = new FormData();
      const password = generatePassword();
      formdata.append("password", password);
      formdata.append("ID", String(user.ID));

      const response = await spAPI.post<DefaultResponse>("auth", formdata, {
        params: {
          type: "reset",
        },
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            4,
            "user_accounts",
            response.data.id,
            `${user.user}`
          );
        }
      }
    },
    onSuccess: (data) => {
      if (!data || !ID) return;
      queryClient.refetchQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users", ID] });
    },
    onError: catchError,
  });
};

export const useValidateEmail = () => {
  return useMutation({
    mutationFn: async (email_address: string) => {
      const formdata = new FormData();
      formdata.append("email_address", email_address);
      try {
        const localResponse = await spAPI.post<PasswordResetData>(
          "auth",
          formdata,
          {
            params: {
              type: "validate_email",
            },
          }
        );

        // // External OOH API call
        // const oohResponse = await oohAPI.post<OOHEmailValidate>(
        //   `user/email-verification`,
        //   {
        //     email_address: email_address,
        //   }
        // );

        console.log("Local Response:", localResponse.data);
        // console.log("OOH Response:", oohResponse.data);

        return {
          local: localResponse.data,
          // ooh: oohResponse.data,
        };
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
    onError: catchError,
  });
};

export const useValidateCode = () => {
  return useMutation({
    mutationFn: async ({ code, ID }: { code: string; ID: string }) => {
      const password = generatePassword();
      const formdata = new FormData();
      formdata.append("code", code);
      formdata.append("ID", ID);
      formdata.append("password", password);
      try {
        const localResponse = await spAPI.post<DefaultResponse>(
          "auth",
          formdata,
          {
            params: {
              type: "validate_code",
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

        return {
          local: localResponse.data,
          // ooh: oohResponse.data,
        };
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
    onError: catchError,
  });
};
