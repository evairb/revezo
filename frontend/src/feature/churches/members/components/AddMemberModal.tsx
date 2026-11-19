
import { useState, type FormEvent } from "react";

import { Search, UserPlus, UserRound, X } from "lucide-react";

import {
  createChurchMembership,
  searchChurchUsers,
} from "../service";

import type {
  ChurchRole,
  UserSearchResult,
} from "../types";

interface AddMemberModalProps {
  churchId: number;
  onClose: () => void;
  onCreated: () => void;
}

export const AddMemberModal = ({
  churchId,
  onClose,
  onCreated,
}: AddMemberModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<ChurchRole>("member");

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchError, setSearchError] = useState("");
  const [formError, setFormError] = useState("");

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
        role: selectedRole,
      });

      onCreated();
      onClose();
    } catch {
      setFormError(
        "Não foi possível adicionar o membro. Verifique os dados e suas permissões.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Adicionar membro
            </h2>

            <p className="mt-1 text-sm text-muted">
              Pesquise um usuário já cadastrado no Revezo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted hover:bg-muted/10 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label
              htmlFor="user-search"
              className="mb-2 block text-sm font-medium"
            >
              Nome ou e-mail
            </label>

            <div className="flex gap-2">
              <input
                id="user-search"
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
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
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
          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium">
              Usuários encontrados
            </p>

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
          <p className="mt-4 text-sm text-red-500">
            {searchError}
          </p>
        )}

        {selectedUser && (
          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4 border-t border-border pt-5"
          >
            <div>
              <label
                htmlFor="membership-role"
                className="mb-2 block text-sm font-medium"
              >
                Função na igreja
              </label>

              <select
                id="membership-role"
                value={selectedRole}
                onChange={(event) =>
                  setSelectedRole(event.target.value as ChurchRole)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
              >
                <option value="member">Membro</option>
                <option value="admin">Administrador da igreja</option>
              </select>

              <p className="mt-2 text-xs text-muted">
                Administradores da igreja poderão gerenciar os cadastros e vínculos da igreja.
              </p>
            </div>

            {formError && (
              <p className="text-sm text-red-500">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
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
    </div>
  );
};
