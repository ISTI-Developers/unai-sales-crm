/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { useProvider } from "./provider";
import { ProviderProps } from "@/interfaces";
import { useLocation } from "react-router-dom";
import {
  Medium,
  MediumCompany,
  MediumContext,
  MediumWithCompanies,
  MediumWithUpdate,
} from "@/interfaces/mediums.interface";
import axios from "axios";
import { User } from "@/interfaces/user.interface";

const MediumContextProvider = createContext<MediumContext | null>(null);

export const useMedium = (): MediumContext => {
  const context = useContext(MediumContextProvider);

  if (context === null || context === undefined) {
    throw new Error("useMedium must be used within a MediumProvider");
  }

  return context;
};

export function MediumProvider({ children }: ProviderProps) {
  const { authHeader, handleError, handleSessionExpiration } = useProvider();
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const mediumURL = `${url}mediums`;
  const location = useLocation();
  const currentUser = localStorage.getItem("currentUser");

  const [mediums, setMediums] = useState<Medium[] | null>(null);
  const [mediumsOfCompanies, setMediumsOfCompanies] = useState<
    MediumWithCompanies[] | null
  >(null);
  const [reload, setReload] = useState(0);

  const getMediums = async () => {
    try {
      const response = await axios.get(mediumURL, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const getMediumPerCompanies = async () => {
    try {
      const response = await axios.get(mediumURL + "?with=companies", {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };
  const getMediumsOfCompany = async (id: string | number) => {
    try {
      const response = await axios.get(mediumURL + "?with=company&id=" + id, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const insertMediums = async (data: MediumCompany[]) => {
    try {
      if (!currentUser) return;
      const user: User = JSON.parse(currentUser);

      const formdata = new FormData();
      formdata.append("data", JSON.stringify(data));
      formdata.append("id", String(user.ID));

      const response = await axios.post(`${mediumURL}?type=insert`, formdata, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const updateMedium = async (data: MediumWithUpdate) => {
    try {
      if (!currentUser) return;
      const user: User = JSON.parse(currentUser);

      const response = await axios.put(
        `${mediumURL}?type=update`,
        {
          data: JSON.stringify(data),
          id: user.ID,
        },
        {
          headers: authHeader(),
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const deleteMedium = async (id: number | string) => {
    try {
      if (!currentUser) return;
      const user: User = JSON.parse(currentUser);

      const response = await axios.delete(
        `${mediumURL}?id=${id}&user_id=${user.ID}`,
        {
          headers: authHeader(),
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (!currentUser) return;
      let mediumResponse = await getMediums();
      let withCompanies = await getMediumPerCompanies();
      mediumResponse = handleSessionExpiration(mediumResponse);
      withCompanies = handleSessionExpiration(withCompanies);
      setMediums(mediumResponse);
      setMediumsOfCompanies(withCompanies);
    };
    setup();
  }, [url, location, mediumURL, currentUser, reload]);

  const value = {
    mediums,
    mediumsOfCompanies,
    insertMediums,
    updateMedium,
    deleteMedium,
    getMediumsOfCompany,
    setReload,
  };

  return (
    <MediumContextProvider.Provider value={value}>
      {children}
    </MediumContextProvider.Provider>
  );
}
