import { useCallback, useEffect, useState } from "react";

import {
  getMinistryMemberships,
  createMinistryMembership,
  updateMinistryMembership,
} from "../service";

import type {
  MinistryMembership,
  MinistryMembershipPayload,
  MinistryMembershipUpdatePayload,
} from "../types";

export const useMinistryMembers = (ministryId: number) => {
  const [activeMembers, setActiveMembers] = useState<MinistryMembership[]>([]);
  const [inactiveMembers, setInactiveMembers] = useState<MinistryMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!ministryId) {
      setActiveMembers([]);
      setInactiveMembers([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const [activeResponse, inactiveResponse] = await Promise.all([
        getMinistryMemberships(ministryId, "active"),
        getMinistryMemberships(ministryId, "inactive"),
      ]);
      setActiveMembers(activeResponse.results);
      setInactiveMembers(inactiveResponse.results);
    } catch (error) {
      console.error("Erro ao carregar membros do ministério:", error);
      setError("Não foi possível carregar os membros do ministério.");
      setActiveMembers([]);
      setInactiveMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [ministryId]);

  const addMember = async (data: MinistryMembershipPayload) => {
    setIsSaving(true);
    setError(null);

    try {
      await createMinistryMembership(data);
      await fetchMembers();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar membro ao ministério:", error);
      setError("Não foi possível adicionar o membro ao ministério.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const editMember = async (
    membershipId: number,
    data: MinistryMembershipUpdatePayload,
  ) => {
    setIsSaving(true);
    setError(null);

    try {
      await updateMinistryMembership(membershipId, data);
      await fetchMembers();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar membro do ministério:", error);
      setError("Não foi possível atualizar o membro.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  return {
    activeMembers,
    inactiveMembers,
    isLoading,
    isSaving,
    error,
    addMember,
    editMember,
    refreshMembers: fetchMembers,
  };

}