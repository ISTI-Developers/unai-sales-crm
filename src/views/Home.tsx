import { Helmet } from "react-helmet";
import { Navigate, Route, Routes } from "react-router-dom";
import InitialSetup from "@/components/home/initialSetup.home";
import { AnimatePresence, motion } from "framer-motion";
import UnderConstructionPage from "@/misc/UnderConstructionPage";
import { Suspense } from "react";
import ErrorPage from "@/misc/ErrorPage";
import { useSettings } from "@/providers/settings.provider";
import { LoaderCircle } from "lucide-react";
// import { SidebarProvider } from "@/providers/sidebar.provider";
import { useAuth } from "@/providers/auth.provider";
import { RolesProvider } from "@/providers/roles.provider";
import Container from "@/misc/Container";
import useLinks from "@/data/links";
import HomeSidebar from "@/components/sidebar/sidebar.home";

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
        <HomeSidebar>
          <main className="relative max-h-screen w-full">
            <Helmet>
              <title>Home | Sales Platform</title>
            </Helmet>
            {/* <Sidebar /> */}
            <HomeRoutes />
            <AnimatePresence mode="wait">
              {user &&
                (user.status === "new" || user.status === "password reset") && (
                  <InitialSetup />
                )}
            </AnimatePresence>
          </main>
        </HomeSidebar>
      </RolesProvider>
    </>
  );
};

const HomeRoutes = () => {
  const { links } = useLinks()

  return (
    links.length > 0 && (
      <Routes>
        {links.filter(link => import.meta.env.MODE !== "development" ? link.handler !== "/new" : link).map((route) =>
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
