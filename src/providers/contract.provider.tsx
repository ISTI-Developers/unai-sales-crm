import { createContext, useContext, useEffect, useState } from "react";
import { ProviderProps } from "@/interfaces";
import { Contract, Contracts } from "@/interfaces/contract.interface";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "./auth.provider";
import { spAPI } from "./api";

const ContractProviderContext = createContext<Contracts | null>(null);

export const useContract = (): Contracts => {
  const context = useContext(ContractProviderContext);

  if (context === undefined || context === null) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};

export function ContractProvider({ children }: ProviderProps) {
  const { user } = useAuth();
  const previousHour = format(
    new Date(new Date().setHours(new Date().getHours() - 1)),
    "MM-dd-yyyy-HH"
  );
  const storedContracts = localStorage.getItem(
    `contracts_${format(new Date(), "MM-dd-yyyy-HH")}`
  );
  const { pathname } = useLocation();

  const [contracts, setContracts] = useState<Contract[] | null>(null);

  useEffect(() => {
    if (!user || !pathname.includes("contracts")) return;

    const setup = async () => {
      const currentHour = format(new Date(), "MM-dd-yyyy-HH");
      if (storedContracts && previousHour < currentHour) {
        setContracts(JSON.parse(storedContracts));
      } else {
        const response = await spAPI.get(`contracts`);

        if (Array.isArray(response.data)) {
          setContracts(response.data);
          localStorage.setItem(
            `contracts_${format(new Date(), "MM-dd-yyyy-HH")}`,
            JSON.stringify(response.data)
          );
          localStorage.removeItem(`contracts_${previousHour}`);
        }
      }
    };

    setup();
  }, [user, pathname, storedContracts]);
  const value = { contracts };

  return (
    <ContractProviderContext.Provider value={value}>
      {children}
    </ContractProviderContext.Provider>
  );
}
