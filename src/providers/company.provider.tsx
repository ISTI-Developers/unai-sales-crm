import { createContext, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ErrorResponse } from "react-router-dom";
import { ProviderProps } from "@/interfaces";
import { CompanyTypes, newCompanyProps } from "@/interfaces/company.interface";
import { SalesGroup } from "@/interfaces/user.interface";
import Cookies from "js-cookie";
import { useLog } from "./log.provider";

const CompanyProviderContext = createContext<CompanyTypes | null>(null);

export const useCompany = (): CompanyTypes => {
  const context = useContext(CompanyProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a CompanyProvider");
  }

  return context;
};

export function CompanyProvider({ children }: ProviderProps) {
  const url = import.meta.env.VITE_LOCAL_SERVER;

  const { logActivity } = useLog();
  const [companies, setCompanies] = useState(null);
  const [salesGroupCompanies, setSalesGroupCompanies] = useState<
    SalesGroup[] | null
  >(null);

  const getCompanies = async () => {
    try {
      const response = await axios.get(url + "companies", {
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

  const getSalesUnitSummary = async () => {
    try {
      const response = await axios.get(url + "companies?sales_units_summary", {
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

  const insertCompany = async (newCompany: newCompanyProps) => {
    try {
      const companyData = new FormData();
      companyData.append("code", newCompany.code);
      companyData.append("name", newCompany.name);
      companyData.append("sales_units", JSON.stringify(newCompany.sales_units));
      const response = await axios.post(url + "companies", companyData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            17,
            "companies",
            response.data.id,
            newCompany.name
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

  const updateCompany = async (
    id: number | string,
    newCompany: newCompanyProps
  ) => {
    try {
      const response = await axios.put(
        url + `companies?id=${id}`,
        {
          ...newCompany,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (response.data) {
        console.log(response.data);
        if (response.data.id) {
          return await logActivity(
            18,
            "companies",
            response.data.id,
            newCompany.name
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

  useEffect(() => {
    const setup = async () => {
      const companyList = await getCompanies();
      const salesUnitSummary = await getSalesUnitSummary();
      setSalesGroupCompanies(salesUnitSummary);
      setCompanies(companyList);
    };

    setup();
  }, []);

  const value = {
    getCompanies,
    companies,
    salesGroupCompanies,
    insertCompany,
    updateCompany,
  };

  return (
    <CompanyProviderContext.Provider value={value}>
      {children}
    </CompanyProviderContext.Provider>
  );
}
