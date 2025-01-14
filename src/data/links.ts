/* eslint-disable react-hooks/exhaustive-deps */
import { useRole } from "@/providers/role.provider";
import {
  BookUser,
  Building,
  FileChartColumnIncreasing,
  FilePenLine,
  History,
  LayoutDashboard,
  LucideProps,
  Package2,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";
import { v4 } from "uuid";

interface Link {
  id: string;
  handler: string;
  title: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  hasSeparator?: boolean;
  isActive: boolean;
}

const Links = () => {
  const { modules, currentUserRole } = useRole();
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

  // Static array definition for better maintainability
  const linkDefinitions = [
    {
      title: "dashboard",
      handler: "",
      icon: LayoutDashboard,
      hasSeparator: true,
    },
    { title: "clients", handler: "/clients", icon: BookUser },
    { title: "contracts", handler: "/contracts", icon: FilePenLine },
    {
      title: "reports",
      handler: "/reports",
      icon: FileChartColumnIncreasing,
    },
    { title: "companies", handler: "/companies", icon: Building },
    {
      title: "mediums",
      handler: "/mediums",
      icon: Package2,
      hasSeparator: true,
    },
    { title: "users", handler: "/users", icon: UsersRound },
    { title: "roles", handler: "/roles", icon: UserRoundCog },
    { title: "logs", handler: "/logs", icon: History },
  ];

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

        return matchRole ? !hasNoPermissions(matchRole.permissions) : true;
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
