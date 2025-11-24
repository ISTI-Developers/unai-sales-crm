import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoutes() {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("token");

  localStorage.setItem("last_location",`${location.pathname}${location.search}`);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoutes;
