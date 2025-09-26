import { toast } from "@/hooks/use-toast";
import { User } from "@/interfaces/user.interface";
import axios, { AxiosError } from "axios";

const mainURL = import.meta.env.VITE_SERVER;
export const spAPI = axios.create({ baseURL: mainURL, timeout: 120000 });

spAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (
      !["auth", "roles"].some((path) => config.url?.includes(path)) &&
      !token
    ) {
      return Promise.reject({
        message: "No authentication token found. Request cancelled.",
        config,
        isAuthError: true, // optional custom flag
      });
    }
    if (token && !config.url?.includes("auth")) {
      config.headers.Authorization = `Bearer ${token}`;
      const currentUserString = localStorage.getItem("currentUser");
      if (currentUserString) {
        const currentUser: User = JSON.parse(currentUserString);
        config.headers["X-User-Id"] = currentUser.ID;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export function logoutAndRedirect() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("last_location");
  sessionStorage.removeItem("loginTime");
  localStorage.removeItem("token");
  localStorage.removeItem("OOHToken");
  localStorage.removeItem("OOHID");
  sessionStorage.removeItem("loginTime");
  window.location.href = "/login";
}
spAPI.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    let msg = "Something went wrong...";
    if (error.message) {
      msg = error.message;
    }

    if (msg === "Network Error") {
      toast({
        title: "Network Error",
        description:
          "The host could not connect to the server. Please message the IT team",
        variant: "destructive",
        itemID: "1",
      });
    }
    if (/No authentication token found. Request cancelled/.test(msg)) {
      toast({
        title: "Session Expired",
        description: msg,
        variant: "destructive",
        itemID: "1",
      });
      logoutAndRedirect();
      return;
    }
    if (error.response?.data) {
      const data = error.response.data as { error?: string };
      msg = data.error ?? msg;

      if (/Session.*expired/i.test(msg)) {
        toast({
          title: "Session Expired",
          description: msg,
          variant: "destructive",
          itemID: "1",
        });
        logoutAndRedirect();
        return;
      }
    }
    return Promise.reject(new Error(msg));
  }
);
// oohAPI.interceptors.response.use(
//   (res) => res,
//   (error: AxiosError) => {
//     let msg = "Something went wrong...";

//     if (error.message) {
//       msg = error.message;
//     }
//     if (error.response?.data) {
//       const data = error.response.data as { error?: string };
//       msg = data.error ?? msg;

//       if (/Session.*expired/i.test(msg)) {
//         toast({
//           title: "Session Expired",
//           description: msg,
//           variant: "destructive",
//           itemID: "1",
//         });
//         logoutAndRedirect();
//         return;
//       }
//     }
//     return Promise.reject(new Error(msg));
//   }
// );

export const catchError = (error: unknown) => {
  if (error instanceof Error) {
    toast({
      title: "System Error",
      description: error.message,
      variant: "destructive",
    });
  }
};
