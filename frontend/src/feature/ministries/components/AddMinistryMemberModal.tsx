
import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";

import { getChurchMembers } from "../../churches/members/service";
import type { ChurchMembership } from "../../churches/members/types";

import type {
  MinistryMembership,
  MinistryRole,
} from "../types";

interface AddMinistryMemberModalProps {
  open: boolean;
  churchId: number;
  existingMembers: MinistryMembership[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (userId: number, role: MinistryRole) => Promise<boolean>;
}

export const AddMinistryMemberModal = ({
  open,
  churchId,
  existingMembers,
  saving,
  onClose,
  onSubmit,
}: AddMinistryMemberModalProps) => {
  const [members, setMembers] = useState<ChurchMembership[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [role, setRole] = useState<MinistryRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getChurchMembers(churchId, "active");
        setMembers(response.results);
      } catch (error) {
        console.error("Erro ao carregar membros da igreja:", error);
        setError("Não foi possível carregar os membros da igreja.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMembers();
  }, [open, churchId]);

  const availableMembers = useMemo(() => {
    const existingUserIds = new Set(
      existingMembers.map((member) => member.user),
    );

    return members.filter((member) => {
      if (existingUserIds.has(member.user)) return false;

      const normalizedSearch = search.toLowerCase().trim();

      return (
        member.user_email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [members, existingMembers, search]);

  const handleSubmit = async () => {
    if (!selectedUser) return;

    const success = await onSubmit(selectedUser, role);

    if (success) {
      setSelectedUser(null);
      setSearch("");
      setRole("member");
      onClose();
    }
  };

  const handleClose = () => {
    if (saving) return;

    setSelectedUser(null);
    setSearch("");
    setRole("member");
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Adicionar integrante
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Selecione um membro ativo da igreja.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por e-mail..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Carregando membros...
            </p>
          ) : availableMembers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Nenhum membro disponível para adicionar.
            </p>
          ) : (
            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
              {availableMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedUser(member.user)}
                  className={`rounded-lg border p-3 text-left transition ${
                    selectedUser === member.user
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.user_email}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Função no ministério
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as MinistryRole)
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="member">Membro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 p-5 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedUser || saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus size={16} />
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
};
