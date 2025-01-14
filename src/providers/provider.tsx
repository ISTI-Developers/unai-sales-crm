import { toast } from "@/hooks/use-toast";
import { DefaultResponse, ErrorResponse } from "@/interfaces";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const useProvider = () => {
  const navigate = useNavigate();
  const authHeader = () => ({
    Authorization: `Bearer ${Cookies.get("token")}`,
  });

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return axiosError.response?.data || axiosError.message;
    }
    console.error("Unexpected error:", error);
  };

  const handleSessionExpiration = (response: [] | DefaultResponse) => {
    if (response.error) {
      if (response.error === "Sessions Expired. Please login again.") {
        toast({
          itemID: "1",
          variant: "destructive",
          title: "Session Expired",
          description: response.error ?? "Please contact the IT team.",
        });

        localStorage.removeItem("currentUser");
        localStorage.removeItem("last_location");
        sessionStorage.removeItem("loginTime");
        navigate("/");
      }
    } else {
      return response;
    }
  };

  return {
    authHeader,
    handleError,
    handleSessionExpiration,
  };
};
