import { useRoles } from "@/hooks/useRoles";
import { List, ProviderProps } from "@/interfaces";
import { Role } from "@/interfaces/user.interface";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface RolesProvider {
  roleOptions: List[];
  role: Role[] | null;
  setRole: Dispatch<SetStateAction<Role[] | null>>;
}
const RolesProviderContext = createContext<RolesProvider | null>(null);

export const useRoleProvider = (): RolesProvider => {
  const context = useContext(RolesProviderContext);
  if (context === null || context === undefined) {
    throw new Error("useRoles must be used within a RoleProvider");
  }
  return context;
};

export function RolesProvider({ children }: ProviderProps) {
  const { data, isLoading } = useRoles();

  const [role, setRole] = useState<Role[] | null>(null);
  const [roleOptions, setRoleOptions] = useState<List[]>([]);

  useEffect(() => {
    if (isLoading || !data) return;
    setRoleOptions(
      data.map(({ role_id, name }) => ({
        id: String(role_id),
        value: name,
        label: name,
      }))
    );
  }, [data, isLoading]);


  const value = {
    role,
    roleOptions,
    setRole,
  };

  return (
    <RolesProviderContext.Provider value={value}>
      {children}
    </RolesProviderContext.Provider>
  );
}
