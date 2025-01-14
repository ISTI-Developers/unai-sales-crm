import { ThemeProvider } from "@/providers/theme.provider";
import { AuthProvider } from "@/providers/auth.provider";
import { Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoutes from "./misc/ProtectedRoutes";
import Login from "./views/Login";
import Home from "./views/Home";
import { ToastProvider } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserProvider } from "./providers/users.provider";
import { Toaster } from "./components/ui/toaster";
import { RoleProvider } from "./providers/role.provider";
import ErrorPage from "./misc/ErrorPage";
import { ClientProvider } from "./providers/client.provider";
import { LogProvider } from "./providers/log.provider";
import Cookies from "js-cookie";
import { MediumProvider } from "./providers/mediums.provider";
import { ContractProvider } from "./providers/contract.provider";
import { ReportProvider } from "./providers/reports.provider";

function App() {
  const location = useLocation();
  return (
    <>
      <ToastProvider duration={3000}>
        <LogProvider>
          <AuthProvider>
            <UserProvider>
              <RoleProvider>
                <MediumProvider>
                  <ClientProvider>
                    <ReportProvider>
                      <ContractProvider>
                        <ThemeProvider
                          defaultTheme="light"
                          storage_key="crm-theme"
                        >
                          <TooltipProvider>
                            <Routes location={location} key={location.pathname}>
                              <Route path="/login" element={<Login />} />
                              <Route element={<ProtectedRoutes />}>
                                <Route path="/*" element={<Home />} />
                              </Route>
                              <Route path="*" element={<ErrorPage />} />
                            </Routes>
                            <Toaster />
                          </TooltipProvider>
                        </ThemeProvider>
                      </ContractProvider>
                    </ReportProvider>
                  </ClientProvider>
                </MediumProvider>
              </RoleProvider>
            </UserProvider>
          </AuthProvider>
        </LogProvider>
      </ToastProvider>
      <p className="absolute bottom-0 bg-black opacity-5 transition-all z-50 text-xs p-1 px-2 text-white hover:opacity-20">
        {Cookies.get("token")}
      </p>
    </>
  );
}

export default App;
