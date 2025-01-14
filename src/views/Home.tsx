import Sidebar from "@/components/dashboard/sidebar.dashboard";
import { Helmet } from "react-helmet";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Companies from "./Companies";
import { CompanyProvider } from "@/providers/company.provider";
import Users from "./Users";
import InitialSetup from "@/components/home/initialSetup.home";
import { AnimatePresence } from "framer-motion";
import useStoredUser from "@/hooks/useStoredUser";
import Roles from "./Roles";
import UnderConstructionPage from "@/misc/UnderConstructionPage";
import { useRole } from "@/providers/role.provider";
import { useMemo } from "react";
import ErrorPage from "@/misc/ErrorPage";
import Clients from "./Clients";
import Logs from "./Logs";
import Mediums from "./Mediums";
import Contracts from "./Contracts";
import Reports from "./Reports";

interface Link {
  title: string;
  handler: string;
  element: JSX.Element | null;
  isActive: boolean;
}
const Home = () => {
  const { user } = useStoredUser();
  const { modules, currentUserRole } = useRole();
  const isActive = (title: string): boolean => {
    if (!modules) return false;

    return modules.some(
      (module) =>
        module.name.toLowerCase().includes(title) && module.status === "active"
    );
  };
  const hasNoPermissions = (permissions: number[]) =>
    permissions.every((permission) => permission === 0);

  const linkDefinitions = [
    { title: "dashboard", handler: "", element: <Dashboard /> },
    { title: "companies", handler: "/companies/*", element: <Companies /> },
    { title: "contracts", handler: "/contracts/*", element: <Contracts /> },
    { title: "clients", handler: "/clients/*", element: <Clients /> },
    { title: "mediums", handler: "/mediums/*", element: <Mediums /> },
    { title: "reports", handler: "/reports/*", element: <Reports /> },
    { title: "users", handler: "/users/*", element: <Users /> },
    { title: "roles", handler: "/roles/*", element: <Roles /> },
    { title: "logs", handler: "/logs", element: <Logs /> },
  ];

  const links: Link[] = useMemo(() => {
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
        isActive: currentUserRole.role_id === 2 ? false : isActive(link.title),
      }));
  }, [modules, currentUserRole]);
  return (
    <main className="relative h-screen">
      <Helmet>
        <title>Home | Sales CRM Dashboard</title>
      </Helmet>
      <Sidebar />
      {links.length > 0 && (
        <CompanyProvider>
          <Routes>
            {links.map((route) =>
              route.element ? (
                <Route
                  key={route.handler}
                  path={route.handler}
                  element={route.isActive ? route.element : <ErrorPage />}
                />
              ) : (
                <Route
                  key={route.handler}
                  path={route.handler}
                  element={<UnderConstructionPage />}
                />
              )
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CompanyProvider>
      )}
      <AnimatePresence mode="wait">
        {user &&
          (user.status === "new" || user.status === "password reset") && (
            <InitialSetup />
          )}
      </AnimatePresence>
    </main>
  );
};

export default Home;
