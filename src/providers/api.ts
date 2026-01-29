import { toast } from "@/hooks/use-toast";
import { User } from "@/interfaces/user.interface";
import { QueryKey } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { openDB } from "idb";

const mainURL = import.meta.env.VITE_SERVER;
const OOHURL = import.meta.env.VITE_OOH_SERVER;
const WPURL = import.meta.env.VITE_WP;

export const spAPI = axios.create({ baseURL: mainURL, timeout: 120000 });
export const ooh = axios.create({ baseURL: OOHURL, timeout: 120000 });
export const wp = axios.create({ baseURL: `${WPURL}unis/`, timeout: 120000 });
export const wpAPI = axios.create({ baseURL: `${WPURL}`, timeout: 120000 });

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
  (error) => Promise.reject(error),
);
ooh.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_OOH_KEY;
    config.headers["x-api-key"] = token;
    return config;
  },
  (error) => Promise.reject(error),
);

wp.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_OOH_KEY;
    config.headers["x-api-key"] = token;
    return config;
  },
  (error) => Promise.reject(error),
);

wpAPI.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_OOH_KEY;
    config.headers["x-api-key"] = token;
    return config;
  },
  (error) => Promise.reject(error),
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
ooh.interceptors.response.use(
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
    return Promise.reject(new Error(msg));
  },
);
wp.interceptors.response.use(
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
    return Promise.reject(new Error(msg));
  },
);
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
  },
);

export const catchError = (error: unknown) => {
  if (error instanceof Error) {
    toast({
      title: "System Error",
      description: error.message,
      variant: "destructive",
    });
  }
};

//INDEXED DB CONFIGURATIONS
export const idb = openDB(
  "sales-platform",
  import.meta.env.VITE_CURRENT_VERSION,
  {
    upgrade(db) {
      if (!db.objectStoreNames.contains("bookings")) {
        db.createObjectStore("bookings", {
          keyPath: "key",
        });
      }
      if (!db.objectStoreNames.contains("maps")) {
        db.createObjectStore("maps", {
          keyPath: "key",
        });
      }
    },
  },
);

export async function saveQuery<TData>(
  store: string,
  key: QueryKey,
  data: TData[],
) {
  const db = await idb;
  await db.put(store, {
    key: JSON.stringify(key),
    data,
    lastFetched: Date.now(),
  });
}
export async function saveRecord<TData>(
  store: string,
  key: string,
  data: TData,
  options?: unknown,
) {
  const db = await idb;
  await db.put(store, {
    key,
    data,
    options: options ? JSON.stringify(options) : undefined,
    lastFetched: Date.now(),
  });
}
export async function getRecord<Data>(
  store: string,
  key: string,
): Promise<RecordType<Data>> {
  const db = await idb;
  return db.get(store, key);
}
type RecordType<Data> = {
  key: string;
  data: Data;
  lastFetched: number;
  options?: unknown;
};

type ReturnType<Data> = {
  key: string;
  data: Data[];
  lastFetched: number;
};

export async function getQuery<Data>(
  store: string,
  key: QueryKey,
): Promise<ReturnType<Data>> {
  const db = await idb;
  return db.get(store, JSON.stringify(key));
}
