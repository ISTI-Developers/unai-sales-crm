/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { Advisory, AuthTypes } from "@/interfaces/auth.interface";
import { DefaultResponse, ProviderProps } from "@/interfaces";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/interfaces/user.interface";
import { catchError, spAPI } from "./api";
import { AxiosProgressEvent } from "axios";

const AuthProviderContext = createContext<AuthTypes | null>(null);

export const useAuth = (): AuthTypes => {
    const context = useContext(AuthProviderContext);

    if (context === undefined || context === null) {
      throw new Error("useAuth must be used within a AuthProvider");
    }

    return context;
};

export function AuthProvider({ children }: ProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [advisory, setAdvisory] = useState<Advisory>();
  const [progress, setProgress] = useState<AxiosProgressEvent | null>(null);
  const storedUser = localStorage.getItem("currentUser");

  useEffect(() => {
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [storedUser]);

  const validateToken = async (
    ID: string,
    token: string
  ): Promise<DefaultResponse<Advisory> | false> => {
    try {
      const formdata = new FormData();
      formdata.append("token", token);
      formdata.append("ID", ID);
      const response = await spAPI.post<DefaultResponse<Advisory>>(
        "auth?type=verify",
        formdata
      );
      return response.data;
    } catch (error) {
      catchError(error);
    }
    return false;
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("last_location");
    sessionStorage.removeItem("loginTime");
    localStorage.removeItem("token");
    localStorage.removeItem("OOHToken");
    localStorage.removeItem("OOHID");
    navigate("/login");
  };

  useEffect(() => {
    if (!user) return;

    const setup = async () => {
      const { ID, password, status } = user;
      const hasStoredShown = localStorage.getItem("advisory_shown") ?? false;
      const shown = hasStoredShown ? hasStoredShown === "true" : false;

      if (!["new", "password"].includes(status as string)) {
        if (password) {
          try {
            const response = await validateToken(String(ID), password);

            if (response) {
              if (response.item && !shown) {
                localStorage.setItem("advisory_shown", "false");
                setAdvisory(response.item);
              }
              if (!response.acknowledged) {
                toast({
                  title: "Account Reset",
                  description:
                    "Your username or password has been changed. Please login again.",
                  variant: "warning",
                });
                return logoutUser();
              } else if (response.error) {
                console.log(response.error);
              }
            }
          } catch (e) {
            console.log(e);
          }
        } else {
          toast({
            title: "Token Expired",
            description: "Your session token has expired. Please login again.",
            variant: "destructive",
          });
          return logoutUser();
        }
      }

      // Inactivity logout
      const sessionStart = sessionStorage.getItem("loginTime");
      if (sessionStart) {
        const now = new Date().getTime();
        const loginTime = Number(sessionStart);

        if (now - loginTime > 18 * 60 * 60 * 1000) {
          if (localStorage.getItem("saveLogin") !== "true") {
            logoutUser();
          }
        }
      }
    };

    const interval = setInterval(setup, 60000); // single 60s interval
    setup(); // initial run

    return () => clearInterval(interval);
  }, [user, location]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        if (user) {
          sessionStorage.setItem("loginTime", String(new Date().getTime()));
          localStorage.setItem("last_location", location.pathname);
        }
      }, 500);
    };

    window.addEventListener("mousemove", resetTimer);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
    };
  }, [location.pathname, user]);
  const value = {
    user,
    setUser,
    logoutUser,
    advisory,
    setAdvisory,
    setProgress,
    progress,
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}
