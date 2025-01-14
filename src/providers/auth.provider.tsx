import { createContext, useContext, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { AuthTypes } from "@/interfaces/auth.interface";
import { DefaultResponse, ErrorResponse, ProviderProps } from "@/interfaces";
import { useLocation, useNavigate } from "react-router-dom";
import useStoredUser from "@/hooks/useStoredUser";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "./log.provider";
import { UserTable } from "@/interfaces/user.interface";
import Cookies from "js-cookie";

const AuthProviderContext = createContext<AuthTypes | null>(null);

export const useAuth = (): AuthTypes => {
  const context = useContext(AuthProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a AuthProvider");
  }

  return context;
};

export function AuthProvider({ children }: ProviderProps) {
  const location = useLocation();
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const navigate = useNavigate();
  const { user, setUser } = useStoredUser();
  const { toast } = useToast();
  const { logActivity } = useLog();

  const loginUser = async (username: string, password: string) => {
    const formdata = new FormData();
    formdata.append("username", username);
    formdata.append("password", password);

    try {
      const response = await axios.post(url + "auth?type=login", formdata);
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

  const validateToken = async (ID: string, token: string) => {
    try {
      const formdata = new FormData();
      formdata.append("token", token);
      formdata.append("ID", ID);
      const response = await axios.post(url + "auth?type=verify", formdata);
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

  const validateEmailAddress = async (email_address: string) => {
    try {
      const formdata = new FormData();
      formdata.append("email_address", email_address);
      const response = await axios.post(
        url + "auth?type=validate_email",
        formdata
      );
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
  const validateCode = async (code: string, ID: string) => {
    try {
      const formdata = new FormData();
      formdata.append("code", code);
      formdata.append("ID", ID);
      formdata.append("password", generatePassword());
      const response = await axios.post(
        url + "auth?type=validate_code",
        formdata
      );
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

  const resetPassword = async (user: UserTable) => {
    try {
      const formdata = new FormData();
      const password = generatePassword();
      formdata.append("password", password);
      formdata.append("ID", String(user.ID));
      const response = await axios.post(url + "auth?type=reset", formdata);
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

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("last_location");
    sessionStorage.removeItem("loginTime");
    Cookies.remove("token");
    navigate("/login");
  };

  function generatePassword(): string {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const allChars = uppercaseChars + lowercaseChars + numbers;

    let password = "";

    // Ensure at least one uppercase letter, one lowercase letter, and one number
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Fill the remaining characters with random choices from all available characters
    for (let i = 3; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to ensure randomness
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    return password;
  }

  useEffect(() => {
    const setup = async () => {
      if (user !== null) {
        const { ID, password, status } = user;

        if (status === "new" || status === "password reset") return;

        if (password) {
          const response: DefaultResponse = await validateToken(
            String(ID),
            password
          );

          if (response.acknowledged === false) {
            toast({
              title: "Account Reset",
              description:
                "Your username or password has been changed. Please login again.",
              variant: "warning",
            });

            const timeout = setTimeout(logoutUser, 1500);

            return () => clearTimeout(timeout);
          } else {
            if (typeof response === "string") {
              console.error(response);
              toast({
                title: "Server Error Occured",
                description: "Please contact the developer.",
                variant: "destructive",
              });
            }
          }
        } else {
          console.log(user);
          toast({
            title: "Token Expired",
            description: "Your session token has expired. Please login again.",
            variant: "destructive",
          });
          const timeout = setTimeout(logoutUser, 1000);

          return () => clearTimeout(timeout);
        }
      }
    };
    setup();
    const interval = setInterval(setup, 5000);

    return () => clearInterval(interval);
  }, [user, location]);

  useEffect(() => {
    const resetTimer = () => {
      if (localStorage.getItem("currentUser")) {
        sessionStorage.setItem("loginTime", String(new Date().getTime()));
        localStorage.setItem("last_location", location.pathname);
      }
    };
    const checkInactivity = () => {
      if (sessionStorage.getItem("loginTime") !== null) {
        const currentTime = new Date().getTime();
        const sessionTime = Number(sessionStorage.getItem("loginTime"));

        if (currentTime - sessionTime > 10 * 60 * 1000) {
          if (
            localStorage.getItem("saveLogin") &&
            localStorage.getItem("saveLogin") !== "true"
          ) {
            sessionStorage.removeItem("loginTime");
            localStorage.removeItem("currentUser");
            navigate("/login");
          }
        }
      }
    };

    window.addEventListener("mousemove", resetTimer);

    const trackActivity = setInterval(checkInactivity, 1000);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      clearInterval(trackActivity);
    };
  }, [location]);
  const value = {
    loginUser,
    generatePassword,
    logoutUser,
    resetPassword,
    validateEmailAddress,
    validateCode,
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}
