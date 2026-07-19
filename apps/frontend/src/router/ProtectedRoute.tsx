import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AuthRole } from "@/services/authApi";
import { getStoredToken, getStoredUser } from "@/services/authApi";

type ProtectedRouteProps = {
  allowedRoles: AuthRole[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <Outlet />;
}
