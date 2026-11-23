
import { Users } from "lucide-react";

import { MemberItem } from "./MemberItem";

import type { ChurchMembership } from "../types";

interface MembersListProps {
  members: ChurchMembership[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: () => void;
  showAdd: boolean;
}

export const MembersList = ({
  members,
  loading,
  error,
  onRetry,
  onAdd,
  showAdd,
}: MembersListProps) => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">Membros da igreja</h2>

        <p className="mt-1 text-sm text-muted">
          Consulte os membros e suas responsabilidades.
        </p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted">
          Carregando membros...
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <p className="text-red-500">{error}</p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg border border-border px-4 py-2"
          >
            Tentar novamente
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="p-10 text-center">
          <Users
            size={36}
            className="mx-auto mb-3 text-muted"
          />

          <h3 className="font-semibold">
            {showAdd
              ? "Nenhum membro cadastrado"
              : "Nenhum membro inativo"}
          </h3>

          <p className="mt-2 text-sm text-muted">
            {showAdd
              ? "Esta igreja ainda não possui membros vinculados."
              : "Não há membros inativos nesta igreja."}
          </p>

          {showAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-white"
            >
              Adicionar primeiro membro
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {members.map((member) => (
            <MemberItem key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};
