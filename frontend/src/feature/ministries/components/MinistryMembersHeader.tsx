import { UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface MinistryMembersHeaderProps {
  ministryName: string;
  churchName: string;
  backTo?: string;
  onAddMember: () => void;
}

export const MinistryMembersHeader = ({
  ministryName,
  churchName,
  backTo = "/ministerios",
  onAddMember,
}: MinistryMembersHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Link
        to={backTo}
        className="flex w-fit items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-gray-500">{churchName}</p>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Equipe do ministério
          </h1>

          <p className="mt-1 text-sm text-gray-500">{ministryName}</p>
        </div>

        <button
          type="button"
          onClick={onAddMember}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Adicionar integrante
        </button>
      </div>
    </div>
  );
};