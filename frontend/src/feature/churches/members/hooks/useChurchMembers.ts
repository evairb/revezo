
import { useCallback } from "react";

import { useFetchList } from "../../../../shared/hooks/useFetchList";

import { getChurchMembers } from "../service";

import type { ChurchMembership } from "../types";

export const useChurchMembers = (churchId: number | null) => {
  const fetchActiveMembers = useCallback(() => {
    if (churchId === null) {
      return Promise.resolve([] as ChurchMembership[]);
    }

    return getChurchMembers(churchId, "active");
  }, [churchId]);

  const fetchInactiveMembers = useCallback(() => {
    if (churchId === null) {
      return Promise.resolve([] as ChurchMembership[]);
    }

    return getChurchMembers(churchId, "inactive");
  }, [churchId]);

  const active = useFetchList<ChurchMembership>(fetchActiveMembers);
  const inactive = useFetchList<ChurchMembership>(fetchInactiveMembers);

  const refetch = useCallback(() => {
    active.refetch();
    inactive.refetch();
  }, [active.refetch, inactive.refetch]);

  return {
    activeMembers: active.data,
    inactiveMembers: inactive.data,

    loadingActive: active.loading,
    loadingInactive: inactive.loading,

    errorActive: active.error,
    errorInactive: inactive.error,

    refetch,
  };
};
