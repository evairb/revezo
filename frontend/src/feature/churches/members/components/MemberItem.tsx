
import { UserRound, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import type { ChurchMembership } from "../types";

interface MemberItemProps {
  member: ChurchMembership;
}

export const MemberItem = ({ member }: MemberItemProps) => {
  const navigate = useNavigate();
  const { churchId } = useParams();

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const handleClick = () => {
    navigate(`/igrejas/${churchId}/membros/${member.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-muted/5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound size={20} />
        </div>

        <div>
          <h3 className="font-medium">{member.user_email}</h3>

          <p className="mt-1 text-xs text-muted">
            Vinculado em {formatDate(member.joined_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            member.role === "admin"
              ? "bg-primary/10 text-primary"
              : "bg-muted/10 text-muted"
          }`}
        >
          {member.role === "admin" ? "Administrador" : "Membro"}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            member.is_active
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {member.is_active ? "Ativo" : "Inativo"}
        </span>

        <ChevronRight size={18} className="text-muted" />
      </div>
    </button>
  );
};
