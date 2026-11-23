
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { RegisterForm } from "../components/RegisterForm";
import { registerUser, getAuthErrorMessage } from "../service";
import type { RegisterData } from "../types";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await registerUser(data);

      navigate("/login", { replace: true });
    } catch (registerError) {
      setError(getAuthErrorMessage(registerError));
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Crie sua conta
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted">
              Preencha seus dados para começar a utilizar o Revezo.
            </p>
          </div>

          <RegisterForm
            onSubmit={handleRegister}
            isLoading={isSubmitting}
            error={error}
          />

          <p className="mt-6 text-center text-sm text-muted">
            Já possui uma conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>

        <p className="mt-7 text-center text-xs text-muted">
          Revezo — Organização e cuidado com quem serve.
        </p>
      </div>
    </main>
  );
};
