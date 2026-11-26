
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Power, Loader2 } from "lucide-react";

import { useChurchContext } from "../../../app/providers/ChurchProvider";
import { getMinistries } from "../service";
import { useMinistryFunctions } from "../hooks/useMinistryFunctions";

import type { Ministry } from "../types";

type FunctionTab = "active" | "inactive";

export const MinistryFunctionsPage = () => {
  const { ministryId } = useParams();
  const parsedMinistryId = Number(ministryId);

  const { activeChurch } = useChurchContext();

  const [ministryName, setMinistryName] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<FunctionTab>("active");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFunctionId, setEditingFunctionId] = useState<number | null>(null);
  const [functionName, setFunctionName] = useState("");

  const isChurchAdmin =
    activeChurch?.role === "master" || activeChurch?.role === "admin";

  const administeredMinistry = activeChurch?.administered_ministries?.find(
    (ministry) => ministry.id === parsedMinistryId
  );

  const canManageMinistry = isChurchAdmin || !!administeredMinistry;

  const {
    activeFunctions,
    inactiveFunctions,
    isLoading,
    isSaving,
    error,
    addFunction,
    editFunction,
  } = useMinistryFunctions(parsedMinistryId);

  useEffect(() => {
    const loadMinistry = async () => {
      if (!activeChurch || !parsedMinistryId) {
        setPageError("Ministério não encontrado.");
        setIsPageLoading(false);
        return;
      }

      setIsPageLoading(true);
      setPageError(null);

      try {
        if (isChurchAdmin) {
          const response = await getMinistries(activeChurch.id);

          const ministry = response.results.find(
            (item: Ministry) => item.id === parsedMinistryId
          );

          if (!ministry) {
            setPageError("Ministério não encontrado nesta igreja.");
            return;
          }

          setMinistryName(ministry.name);
        } else if (administeredMinistry) {
          setMinistryName(administeredMinistry.name);
        } else {
          setPageError("Você não tem permissão para acessar este ministério.");
        }
      } catch (error) {
        console.error("Erro ao carregar ministério:", error);
        setPageError("Não foi possível carregar os dados do ministério.");
      } finally {
        setIsPageLoading(false);
      }
    };

    void loadMinistry();
  }, [
    activeChurch,
    parsedMinistryId,
    isChurchAdmin,
    administeredMinistry,
  ]);

  const openCreateModal = () => {
    setEditingFunctionId(null);
    setFunctionName("");
    setIsModalOpen(true);
  };

  const openEditModal = (id: number, name: string) => {
    setEditingFunctionId(id);
    setFunctionName(name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFunctionId(null);
    setFunctionName("");
  };

  const handleSave = async () => {
    const name = functionName.trim();

    if (!name) return;

    let success = false;

    if (editingFunctionId) {
      success = await editFunction(editingFunctionId, { name });
    } else {
      success = await addFunction({
        ministry: parsedMinistryId,
        name,
      });
    }

    if (success) closeModal();
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const success = await editFunction(id, {
      is_active: !isActive,
    });

    if (success) {
      setActiveTab(isActive ? "active" : "inactive");
    }
  };

  const displayedFunctions =
    activeTab === "active" ? activeFunctions : inactiveFunctions;

  if (isPageLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-gray-500" size={28} />
      </div>
    );
  }

  if (pageError || !canManageMinistry) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        {pageError || "Você não tem permissão para acessar este ministério."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/ministerios/${parsedMinistryId}/membros`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800 dark:hover:text-gray-200"
        >
          <ArrowLeft size={16} />
          Voltar para equipe
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Funções do ministério
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {ministryName}
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Nova função
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Funções ativas
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {activeFunctions.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Funções inativas
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {inactiveFunctions.length}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          Ativas ({activeFunctions.length})
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "inactive"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          Inativas ({inactiveFunctions.length})
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : displayedFunctions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === "active"
              ? "Nenhuma função cadastrada neste ministério."
              : "Nenhuma função inativa."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {displayedFunctions.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 last:border-b-0 dark:border-gray-800"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {item.is_active ? "Ativa" : "Inativa"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item.id, item.name)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  onClick={() => handleToggleStatus(item.id, item.is_active)}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Power size={16} />
                  {item.is_active ? "Desativar" : "Reativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingFunctionId ? "Editar função" : "Nova função"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Informe o nome da função deste ministério.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome da função
              </label>

              <input
                type="text"
                value={functionName}
                onChange={(event) => setFunctionName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSave();
                }}
                maxLength={100}
                autoFocus
                placeholder="Ex.: Vocalista"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>

              <button
                onClick={() => void handleSave()}
                disabled={isSaving || !functionName.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
