
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Settings2 } from "lucide-react";

import { useChurchContext } from "../../../app/providers/ChurchProvider";

import { getMinistries } from "../service";
import type {
  Ministry,
  MinistryMembership,
  MinistryRole,
} from "../types";

import { useMinistryMembers } from "../hooks/useMinistryMembers";
import { useMinistryFunctions } from "../hooks/useMinistryFunctions";

import { MinistryMembersHeader } from "../components/MinistryMembersHeader";
import { MinistryMembersSummary } from "../components/MinistryMembersSummary";
import { MinistryMembersList } from "../components/MinistryMembersList";
import { AddMinistryMemberModal } from "../components/AddMinistryMemberModal";
import { EditMinistryMemberModal } from "../components/EditMinistryMemberModal";

type MembersTab = "active" | "inactive";

export const MinistryMembersPage = () => {
  const { ministryId } = useParams();
  const { activeChurch } = useChurchContext();

  const parsedMinistryId = Number(ministryId);

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [isLoadingMinistry, setIsLoadingMinistry] = useState(true);
  const [ministryError, setMinistryError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<MembersTab>("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] =
    useState<MinistryMembership | null>(null);

  const {
    activeMembers,
    inactiveMembers,
    isLoading,
    isSaving,
    error,
    addMember,
    editMember,
  } = useMinistryMembers(parsedMinistryId);

  const {
    activeFunctions,
    inactiveFunctions,
  } = useMinistryFunctions(parsedMinistryId);

  const allFunctions = [
    ...activeFunctions,
    ...inactiveFunctions,
  ];

  const isChurchAdmin =
    activeChurch?.role === "master" ||
    activeChurch?.role === "admin";

  const administeredMinistry = activeChurch?.administered_ministries?.find(
    (item) => item.id === parsedMinistryId
  );

  const canManageMinistry =
    isChurchAdmin || Boolean(administeredMinistry);

  useEffect(() => {
    const loadMinistry = async () => {
      if (!activeChurch || !parsedMinistryId) {
        setMinistry(null);
        setIsLoadingMinistry(false);
        return;
      }

      setIsLoadingMinistry(true);
      setMinistryError(null);

      try {
        if (isChurchAdmin) {
          const response = await getMinistries(activeChurch.id);

          const foundMinistry = response.results.find(
            (item) => item.id === parsedMinistryId
          );

          setMinistry(foundMinistry ?? null);
        } else if (administeredMinistry) {
          setMinistry({
            id: administeredMinistry.id,
            church: activeChurch.id,
            church_name: activeChurch.name,
            name: administeredMinistry.name,
            is_active: true,
            created_at: "",
            updated_at: "",
          });
        } else {
          setMinistry(null);
        }
      } catch (error) {
        console.error("Erro ao carregar ministério:", error);
        setMinistryError(
          "Não foi possível carregar os dados do ministério."
        );
        setMinistry(null);
      } finally {
        setIsLoadingMinistry(false);
      }
    };

    void loadMinistry();
  }, [
    activeChurch,
    parsedMinistryId,
    isChurchAdmin,
    administeredMinistry,
  ]);

  const handleAddMember = async (
    userId: number,
    role: MinistryRole
  ): Promise<boolean> => {
    const success = await addMember({
      user: userId,
      ministry: parsedMinistryId,
      role,
    });

    if (success) {
      setIsAddModalOpen(false);
    }

    return success;
  };

  const handleEditMember = async (
    memberId: number,
    data: {
      role: MinistryRole;
      functions?: number[];
    }
  ): Promise<boolean> => {
    const success = await editMember(memberId, data);

    if (success) {
      setSelectedMember(null);
    }

    return success;
  };

  const handleToggleStatus = async (
    member: MinistryMembership
  ) => {
    await editMember(member.id, {
      is_active: !member.is_active,
    });
  };

  if (!activeChurch) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300">
          Selecione uma igreja para continuar.
        </p>
      </div>
    );
  }

  if (isLoadingMinistry) {
    return (
      <div className="py-12 text-center text-gray-500">
        Carregando ministério...
      </div>
    );
  }

  if (ministryError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {ministryError}
      </div>
    );
  }

  if (!canManageMinistry || !ministry) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Acesso não disponível
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Você não possui permissão para gerenciar a equipe deste ministério.
        </p>
      </div>
    );
  }

  const currentMembers =
    activeTab === "active" ? activeMembers : inactiveMembers;

  const existingMembers = [
    ...activeMembers,
    ...inactiveMembers,
  ];

  return (
    <div className="space-y-6">
      <MinistryMembersHeader
        ministryName={ministry.name}
        churchName={activeChurch.name}
        backTo={isChurchAdmin ? "/ministerios" : "/"}
        onAddMember={() => setIsAddModalOpen(true)}
      />

      <div className="flex justify-end">
        <Link
          to={`/ministerios/${parsedMinistryId}/funcoes`}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Settings2 size={18} />
          Gerenciar funções
        </Link>
      </div>

      <MinistryMembersSummary
        activeCount={activeMembers.length}
        inactiveCount={inactiveMembers.length}
      />

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === "active"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
        >
          Ativos ({activeMembers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inactive")}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === "inactive"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
        >
          Inativos ({inactiveMembers.length})
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <MinistryMembersList
        members={currentMembers}
        functions={allFunctions}
        isLoading={isLoading}
        onEdit={setSelectedMember}
        onToggleStatus={handleToggleStatus}
      />

      <AddMinistryMemberModal
        open={isAddModalOpen}
        churchId={activeChurch.id}
        existingMembers={existingMembers}
        saving={isSaving}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />

      <EditMinistryMemberModal
        open={Boolean(selectedMember)}
        member={selectedMember}
        functions={activeFunctions}
        saving={isSaving}
        onClose={() => setSelectedMember(null)}
        onSubmit={handleEditMember}
      />
    </div>
  );
};
