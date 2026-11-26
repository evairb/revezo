
import {
  ShieldCheck,
  User,
  UserCheck,
  UserX,
  Pencil,
} from "lucide-react";

import type {
  MinistryFunction,
  MinistryMembership,
} from "../types";

interface MinistryMemberItemProps {
  member: MinistryMembership;
  functions: MinistryFunction[];
  onEdit: (member: MinistryMembership) => void;
  onToggleStatus: (member: MinistryMembership) => void;
}

export const MinistryMemberItem = ({
  member,
  functions,
  onEdit,
  onToggleStatus,
}: MinistryMemberItemProps) => {
  const isAdmin = member.role === "admin";

  const assignedFunctions = functions.filter((item) =>
    member.functions?.includes(item.id)
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {isAdmin ? (
            <ShieldCheck size={21} />
          ) : (
            <User size={21} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-white">
            {member.user_email}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isAdmin ? "Administrador" : "Membro"}
            </span>

            <span className="text-gray-300 dark:text-gray-600">•</span>

            <span
              className={`text-xs font-medium ${member.is_active
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
                }`}
            >
              {member.is_active ? "Ativo" : "Inativo"}
            </span>
          </div>

          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Funções
            </p>

            {assignedFunctions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assignedFunctions.map((item) => (
                  <span
                    key={item.id}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.is_active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                  >
                    {item.name}
                    {!item.is_active && " (inativa)"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Nenhuma função atribuída
              </p>
            )}
          </div>
        </div>
      </div>


      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-36">
        <button
          type="button"
          onClick={() => onEdit(member)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Pencil size={16} />
          Editar
        </button>

        <button
          type="button"
          onClick={() => onToggleStatus(member)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${member.is_active
              ? "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              : "border border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"
            }`}
        >
          {member.is_active ? (
            <>
              <UserX size={16} />
              Desativar
            </>
          ) : (
            <>
              <UserCheck size={16} />
              Reativar
            </>
          )}
        </button>
      </div>

    </div>
  );
};
