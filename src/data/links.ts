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

const Links = () => {
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

  const hasNoPermissions = (permissions: number[]) =>
    permissions.every((permission) => permission === 0);

  // Memoize the links data based on modules
  const links: Link[] = useMemo(() => {
    // console.log(modules, currentUserRole);
    if (!modules || !currentUserRole) return [];

    const permissions = currentUserRole.access;

    return linkDefinitions
      .filter((def) => {
        const matchRole = permissions.find(
          (role) => role.name.toLowerCase() === def.title.toLowerCase()
        );

        return matchRole ? !hasNoPermissions(matchRole.permissions) : false;
      })
      .map((link) => ({
        ...link,
        id: v4(),
        isActive: currentUserRole.role_id === 2 ? false : isActive(link.title),
      }));
  }, [modules, currentUserRole]);

  return { links };
};

export default Links;
