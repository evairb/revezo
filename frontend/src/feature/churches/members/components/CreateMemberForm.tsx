
import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";

import { createChurchMember } from "../service";
import type { ChurchRole } from "../types";

interface CreateMemberFormProps {
  churchId: number;
  onCancel: () => void;
  onCreated: () => void;
}

export const CreateMemberForm = ({
  churchId,
  onCancel,
  onCreated,
}: CreateMemberFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<ChurchRole>("member");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      setSaving(true);

      await createChurchMember({
        church: churchId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      onCreated();
    } catch {
      setError(
        "Não foi possível cadastrar a pessoa. Verifique se o e-mail já está cadastrado e se você possui permissão.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Nome
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={inputClass}
            placeholder="Nome"
            autoComplete="given-name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Sobrenome
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={inputClass}
            placeholder="Sobrenome"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="pessoa@email.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
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
        <label className="mb-2 block text-sm font-medium">
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

      <div>
        <label className="mb-2 block text-sm font-medium">
          Função na igreja
        </label>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as ChurchRole)}
          className={inputClass}
        >
          <option value="member">Membro</option>
          <option value="admin">Administrador da igreja</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <UserPlus size={16} />
          {saving ? "Cadastrando..." : "Cadastrar membro"}
        </button>
      </div>
    </form>
  );
};
