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
import { lazy, Suspense } from "react";
import ScreenLoader from "./misc/ScreenLoader";

const Home = lazy(() => import("./views/Home"));

function App() {
  const location = useLocation();
  return (
    <>
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
