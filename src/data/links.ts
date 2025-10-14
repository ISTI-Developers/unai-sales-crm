/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { v4 } from "uuid";
import { LinkDefinitions, linkDefinitions } from "./definitions.links";
import { useModules } from "@/hooks/useModules";
import { useUserRole } from "@/hooks/useRoles";
import { useAuth } from "@/providers/auth.provider";

interface Link extends LinkDefinitions {
  id: string;
  isActive: boolean;
}

const useLinks = () => {
  const { user } = useAuth();
  const { data: modules } = useModules();
  const { data: currentUserRole } = useUserRole(user?.ID ?? null);

  const isActive = (title: string): boolean => {
    if (!modules) return false;

    return modules.some(
      (module) =>
        module.name.toLowerCase().includes(title.toLowerCase()) &&
        module.status === "active"
    );
  };

  // Memoize the links data based on modules
  const links: Link[] = useMemo(() => {
    // console.log(modules, currentUserRole);
    if (!modules || !currentUserRole) return [];

    const { permissions } = currentUserRole;

    if(!permissions) return [];
    return linkDefinitions
      .filter((def) => {
        const matchRole = permissions.find((permission) => {
          const [module, action] = permission.split(".");
          return (
            module.toLowerCase() === def.title.toLowerCase() &&
            action.includes("view")
          );
        });

        return Boolean(matchRole);
      })
      .map((link) => ({
        ...link,
        id: v4(),
        isActive: currentUserRole.role_id === 2 ? false : isActive(link.title),
      }));
  }, [modules, currentUserRole]);

  return { links };
};

export default useLinks;
