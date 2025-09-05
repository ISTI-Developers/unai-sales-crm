import Sidebar from "@/components/dashboard/sidebar.dashboard";
import { Helmet } from "react-helmet";
import { Navigate, Route, Routes } from "react-router-dom";
import InitialSetup from "@/components/home/initialSetup.home";
import { AnimatePresence, motion } from "framer-motion";
import UnderConstructionPage from "@/misc/UnderConstructionPage";
import { Suspense, useMemo } from "react";
import ErrorPage from "@/misc/ErrorPage";
import { useSettings } from "@/providers/settings.provider";
import { LoaderCircle } from "lucide-react";
import { linkDefinitions } from "@/data/definitions.links";
import { SidebarProvider } from "@/providers/sidebar.provider";
import { useAuth } from "@/providers/auth.provider";
import { useModules } from "@/hooks/useModules";
import { useUserRole } from "@/hooks/useRoles";
import { RolesProvider } from "@/providers/roles.provider";
import Container from "@/misc/Container";

interface Link {
  title: string;
  handler: string;
  element: React.LazyExoticComponent<() => JSX.Element> | null;
  isActive: boolean;
}
const Home = () => {
  const { user } = useAuth();
  const { isLoading } = useSettings();

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-[100dvw] h-[100dvh] flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-[2px] z-20"
          >
            <LoaderCircle className="animate-spin text-main-100" size={48} />
          </motion.div>
        )}
      </AnimatePresence>
      <RolesProvider>
        <SidebarProvider>
          <main className="relative h-screen">
            <Helmet>
              <title>Home | Sales Platform</title>
            </Helmet>
            <Sidebar />
            <HomeRoutes />
            <AnimatePresence mode="wait">
              {user &&
                (user.status === "new" || user.status === "password reset") && (
                  <InitialSetup />
                )}
            </AnimatePresence>
          </main>
        </SidebarProvider>
      </RolesProvider>
    </>
  );
};

const HomeRoutes = () => {
  const { user } = useAuth();
  const { data: modules } = useModules();
  const { data: currentUserRole } = useUserRole(user?.ID ?? null);

  const isActive = (title: string): boolean => {
    if (!modules) return false;

    return modules.some(
      (module) =>
        module.name.toLowerCase().includes(title) && module.status === "active"
    );
  };
  const hasNoPermissions = (permissions: number[]) =>
    permissions.every((permission) => permission === 0);

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
    links.length > 0 && (
      <Routes>
        {links.map((route) =>
          route.element ? (
            <Route
              key={route.handler}
              path={`${route.handler}/*`}
              element={
                <Suspense
                  fallback={
                    <Container title="Loading...">Loading...</Container>
                  }
                >
                  {route.isActive ? <route.element /> : <ErrorPage />}
                </Suspense>
              }
            />
          ) : (
            <Route
              key={route.handler}
              path={route.handler}
              element={<UnderConstructionPage withContainer />}
            />
          )
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  );
};
export default Home;
