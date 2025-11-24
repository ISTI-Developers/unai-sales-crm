import { ThemeProvider } from "@/providers/theme.provider";
import { AuthProvider } from "@/providers/auth.provider";
import { Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoutes from "./misc/ProtectedRoutes";
import Login from "./views/Login";
import { ToastProvider } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import ErrorPage from "./misc/ErrorPage";
import { LogProvider } from "./providers/log.provider";
import { SettingsProvider } from "./providers/settings.provider";
import Changelog from "./misc/changelog";
import Advisory from "./misc/advisory";
import { lazy, Suspense, useState } from "react";
import ScreenLoader from "./misc/ScreenLoader";
import { registerServiceWorker, subscribeUserToPush } from "./lib/notifications";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";

const Home = lazy(() => import("./views/Home"));
const Banner = lazy(() => import("./misc/banner"));

function App() {
  const location = useLocation();
  const hasSubscribed = localStorage.getItem("subscribed");
  const [open, setOpen] = useState(Boolean(!hasSubscribed))

  const onSubscribe = async () => {
    try {
      const registration = await registerServiceWorker();
      if (registration) {
        await subscribeUserToPush(registration);
        localStorage.setItem("subscribed", "true");
        setOpen(false);
        console.log("Push notification ready");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Banner />
      {import.meta.env.MODE === "development" && hasSubscribed === null && <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stay Updated!</AlertDialogTitle>
            <AlertDialogDescription>Allow notifications to receive important updates from Sales Platform.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onSubscribe}>Allow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>}
      <ToastProvider duration={3000}>
        <LogProvider>
          <AuthProvider>
            <Advisory />
            <ThemeProvider defaultTheme="light" storage_key="crm-theme">
              <TooltipProvider>
                <Routes location={location} key={location.pathname}>
                  <Route path="/login" element={<Login />} />
                  <Route element={<ProtectedRoutes />}>
                    <Route
                      path="/*"
                      element={
                        <Suspense fallback={<ScreenLoader />}>
                          <SettingsProvider>
                            <Home />
                          </SettingsProvider>
                        </Suspense>
                      }
                    />
                  </Route>
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </LogProvider>
      </ToastProvider>
      <Changelog />
    </>
  );
}

export default App;
