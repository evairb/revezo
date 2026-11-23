
import { useState, type FormEvent } from "react";
import { Search, UserPlus, UserRound } from "lucide-react";

import {
  createChurchMembership,
  searchChurchUsers,
} from "../service";

import type {
  ChurchRole,
  UserSearchResult,
} from "../types";

interface ExistingMemberFormProps {
  churchId: number;
  onCancel: () => void;
  onCreated: () => void;
}

export const ExistingMemberForm = ({
  churchId,
  onCancel,
  onCreated,
}: ExistingMemberFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [role, setRole] = useState<ChurchRole>("member");

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchError, setSearchError] = useState("");
  const [formError, setFormError] = useState("");

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary";

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const term = searchTerm.trim();

    if (term.length < 3) {
      setSearchError("Digite pelo menos 3 caracteres para pesquisar.");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setSelectedUser(null);
      setSearchResults([]);

      const results = await searchChurchUsers(churchId, term);

      setSearchResults(results);

      if (results.length === 0) {
        setSearchError("Nenhum usuário disponível foi encontrado.");
      }
    } catch {
      setSearchError(
        "Não foi possível pesquisar usuários. Verifique suas permissões.",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      setFormError("Selecione um usuário para continuar.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await createChurchMembership({
        user: selectedUser.id,
        church: churchId,
        role,
      });

      onCreated();
    } catch {
      setFormError(
        "Não foi possível adicionar o membro. Verifique os dados e suas permissões.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Nome ou e-mail
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchResults([]);
                setSelectedUser(null);
                setSearchError("");
                setFormError("");
              }}
              placeholder="Digite nome ou e-mail..."
              className={`min-w-0 flex-1 ${inputClass}`}
            />

            <button
              type="submit"
              disabled={searching || searchTerm.trim().length < 3}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              <Search size={17} />
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </div>

          <p className="mt-1 text-xs text-muted">
            Digite pelo menos 3 caracteres.
          </p>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Usuários encontrados</p>

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {searchResults.map((user) => {
              const isSelected = selectedUser?.id === user.id;

              const fullName = [
                user.first_name,
                user.last_name,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setFormError("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/10"
                  }`}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fullName || user.email}
                    </p>

                    {fullName && (
                      <p className="truncate text-xs text-muted">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <span className="text-xs font-medium text-primary">
                      Selecionado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {searchError && (
        <p role="alert" className="text-sm text-red-500">
          {searchError}
        </p>
      )}

      {selectedUser && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-t border-border pt-4"
        >
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

          {formError && (
            <p role="alert" className="text-sm text-red-500">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
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
              {saving ? "Adicionando..." : "Adicionar membro"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
