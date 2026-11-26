
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, User } from "lucide-react";

import type {
  MinistryFunction,
  MinistryMembership,
  MinistryRole,
} from "../types";

interface EditMinistryMemberModalProps {
  open: boolean;
  member: MinistryMembership | null;
  functions: MinistryFunction[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    memberId: number,
    data: {
      role: MinistryRole;
      functions?: number[];
    }
  ) => Promise<boolean>;
}

export const EditMinistryMemberModal = ({
  open,
  member,
  functions,
  saving,
  onClose,
  onSubmit,
}: EditMinistryMemberModalProps) => {
  const [role, setRole] = useState<MinistryRole>("member");
  const [selectedFunctions, setSelectedFunctions] = useState<number[]>([]);

  useEffect(() => {
    if (open && member) {
      setRole(member.role);
      setSelectedFunctions(member.functions ?? []);
    }
  }, [open, member]);

  if (!open || !member) return null;

  const toggleFunction = (functionId: number) => {
    setSelectedFunctions((current) =>
      current.includes(functionId)
        ? current.filter((id) => id !== functionId)
        : [...current, functionId]
    );
  };

  const handleSubmit = async () => {
    const originalFunctions = member.functions ?? [];

    const originalActiveFunctions = originalFunctions
      .filter((id) => functions.some((item) => item.id === id))
      .sort((a, b) => a - b);

    const currentActiveFunctions = selectedFunctions
      .filter((id) => functions.some((item) => item.id === id))
      .sort((a, b) => a - b);

    const functionsChanged =
      JSON.stringify(originalActiveFunctions) !==
      JSON.stringify(currentActiveFunctions);

    const success = await onSubmit(member.id, {
      role,
      ...(functionsChanged
        ? { functions: currentActiveFunctions }
        : {}),
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Editar integrante
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure o acesso e as funções deste integrante.
          </p>
        </div>

        <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="font-medium text-gray-900 dark:text-white">
            {member.user_email}
          </p>
        </div>

        <div className="mt-6">
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nível de acesso no ministério
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("member")}
              className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition ${role === "member"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
            >
              <User size={18} />
              Membro
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition ${role === "admin"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
            >
              <ShieldCheck size={18} />
              Administrador
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Funções no ministério
            </label>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Selecione todas as funções que este integrante desempenha.
            </p>
          </div>

          {functions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma função ativa cadastrada neste ministério.
              </p>
            </div>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              {functions.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedFunctions.includes(item.id)}
                    onChange={() => toggleFunction(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {item.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {selectedFunctions.length} função(ões) selecionada(s).
          </p>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
};
