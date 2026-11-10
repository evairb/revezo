import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../feature/auth/hooks/useAuth"
import { ROUTES } from "./routePaths";

export const GuestRoute = () => {
  const {isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}