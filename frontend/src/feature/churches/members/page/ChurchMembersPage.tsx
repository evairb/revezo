
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useFetchList } from "../../../../shared/hooks/useFetchList";

import { getChurches } from "../../church/service";
import { useChurchMembers } from "../hooks/useChurchMembers";

import { MembersHeader } from "../components/MembersHeader";
import { MembersSummary } from "../components/MembersSummary";
import { MembersList } from "../components/MembersList";
import { AddMemberModal } from "../components/AddMemberModal";

import type { Church } from "../../church/types";

export const ChurchMembersPage = () => {
  const { churchId } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const parsedChurchId = Number(churchId);

  const validChurchId =
    Number.isInteger(parsedChurchId) && parsedChurchId > 0;

  const {
    data: members,
    loading,
    error,
    refetch,
  } = useChurchMembers(validChurchId ? parsedChurchId : null);

  const {
    data: churches,
    loading: loadingChurches,
  } = useFetchList<Church>(getChurches);

  const church = churches.find(
    (item) => item.id === parsedChurchId,
  );

  if (!validChurchId) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">
          Igreja não encontrada
        </h2>

        <button
          type="button"
          onClick={() => navigate("/igrejas")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-white"
        >
          Voltar para igrejas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MembersHeader
        churchName={church?.name || `Igreja ${parsedChurchId}`}
        loadingChurch={loadingChurches}
        loadingMembers={loading}
        onBack={() => navigate("/igrejas")}
        onRefresh={refetch}
        onAdd={() => setModalOpen(true)}
      />

      <MembersSummary total={members.length} />

      <MembersList
        members={members}
        loading={loading}
        error={error}
        onRetry={refetch}
        onAdd={() => setModalOpen(true)}
      />

      {modalOpen && (
        <AddMemberModal
          churchId={parsedChurchId}
          onClose={() => setModalOpen(false)}
          onCreated={refetch}
        />
      )}
    </div>
  );
};
