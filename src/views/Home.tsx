import { Helmet } from "react-helmet";
import { Navigate, Route, Routes } from "react-router-dom";
import InitialSetup from "@/components/home/initialSetup.home";
import { AnimatePresence, motion } from "framer-motion";
import UnderConstructionPage from "@/misc/UnderConstructionPage";
import { Suspense } from "react";
import ErrorPage from "@/misc/ErrorPage";
import { useSettings } from "@/providers/settings.provider";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";
import { RolesProvider } from "@/providers/roles.provider";
import Container from "@/misc/Container";
import useLinks from "@/data/links";
import HomeSidebar from "@/components/sidebar/sidebar.home";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
// import { useQueryClient } from "@tanstack/react-query";
// import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { registerServiceWorker, subscribeUserToPush } from "@/lib/notifications";

const Home = () => {
  // const queryClient = useQueryClient();
  const { isLoading } = useSettings();
  const defaultOpen = localStorage.getItem("sidebar_state") === "true"
  // const hasSubscribed = localStorage.getItem("subscribed");
  // const [open, setOpen] = useState(Boolean(!hasSubscribed))

  // const onSubscribe = async () => {
  //   try {
  //     const registration = await registerServiceWorker();
  //     if (registration) {
  //       await subscribeUserToPush(registration);
  //       localStorage.setItem("subscribed", "true");
  //       setOpen(false);
  //       console.log("Push notification ready");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }


  // useEffect(() => {
  //   const handler = (event: MessageEvent) => {
  //     if (event.data?.type === "NEW_NOTIFICATION") {
  //       queryClient.invalidateQueries({ queryKey: ["notifications"] });
  //     }
  //   };

  //   navigator.serviceWorker?.addEventListener("message", handler);
  //   return () =>
  //     navigator.serviceWorker?.removeEventListener("message", handler);
  // }, []);
  return (
    <>
      {/* {hasSubscribed === null && <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stay Updated!</AlertDialogTitle>
            <AlertDialogDescription>Allow notifications to receive important updates from Sales Platform.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onSubscribe}>Allow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>} */}
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
        <SidebarProvider defaultOpen={defaultOpen}>
          <HomeSidebar>
            <HomeRoutes />
          </HomeSidebar>
        </SidebarProvider>
      </RolesProvider>
    </>
  );
};

const HomeRoutes = () => {
  const { links } = useLinks()
  const { user } = useAuth();
  const { state } = useSidebar();

  return (
    <main data-state={state} className={cn("relative max-h-[100dvh] w-full transition-all data-[state=collapsed]:lg:max-w-[calc(100dvw-5rem)] data-[state=expanded]:lg:max-w-[calc(100dvw-14rem)]",
    )}>
      <Helmet>
        <title>Home | Sales Platform</title>
      </Helmet>
      {links.length > 0 && (
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
