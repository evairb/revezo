import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import type { LoginCredentials } from "../auth.types";
import { getAuthErrorMessage } from "../auth.service";
import { LoginForm } from "../components/LoginForm";
import { ShieldCheck } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname ?? "/";

  const { login, isAuthenticated, isLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (Credentials: LoginCredentials) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await login(Credentials);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Verificando sessão...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <ShieldCheck size={34} strokeWidth={1.7} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Revezo
          </h1>

          <p className="mt-2 text-sm text-muted">
            Gestão de escalas para igrejas
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-foreground">
              Bem-vindo de volta!
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted">
              Entre com seus dados para acessar sua conta.
            </p>
          </div>

          <LoginForm
            onSubmit={handleLogin}
            isLoading={isSubmitting}
            error={error}
          />
        </div>

        <p className="mt-7 text-center text-xs text-muted">
          Revezo — Organização e cuidado com quem serve.
        </p>
      </div>
    </main>
  );
}