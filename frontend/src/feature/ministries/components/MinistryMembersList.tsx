
import { Users } from "lucide-react";

import type {
  MinistryFunction,
  MinistryMembership,
} from "../types";

import { MinistryMemberItem } from "./MinistryMemberItem";

interface MinistryMembersListProps {
  members: MinistryMembership[];
  functions: MinistryFunction[];
  isLoading: boolean;
  onEdit: (member: MinistryMembership) => void;
  onToggleStatus: (member: MinistryMembership) => void;
}

export const MinistryMembersList = ({
  members,
  functions,
  isLoading,
  onEdit,
  onToggleStatus,
}: MinistryMembersListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500">
          Carregando integrantes...
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
          <Users size={24} />
        </div>

        <h3 className="font-medium text-gray-900 dark:text-white">
          Nenhum integrante encontrado
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Não existem integrantes nesta categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => (
        <MinistryMemberItem
          key={member.id}
          member={member}
          functions={functions}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};
