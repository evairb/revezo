
import { useState, type FormEvent } from "react";
import type { RegisterData } from "../types";

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const RegisterForm = ({
  onSubmit,
  isLoading,
  error,
}: RegisterFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setValidationError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    await onSubmit({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Nome
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={inputClass}
            placeholder="Seu nome"
            autoComplete="given-name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Sobrenome
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={inputClass}
            placeholder="Seu sobrenome"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="seu@email.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Confirmar senha
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClass}
          placeholder="Digite a senha novamente"
          autoComplete="new-password"
          required
        />
      </div>

      {(error || validationError) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {validationError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Criando conta..." : "Criar minha conta"}
      </button>
    </form>
  );
};
