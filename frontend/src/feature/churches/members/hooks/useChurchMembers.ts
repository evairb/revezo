
import { useCallback } from "react";

import { useFetchList } from "../../../../shared/hooks/useFetchList";

import { getChurchMembers } from "../service";

import type { ChurchMembership } from "../types";

export const useChurchMembers = (churchId: number | null) => {
  const fetchMembers = useCallback(() => {
    if (churchId === null) {
      return Promise.resolve([] as ChurchMembership[]);
    }

    return getChurchMembers(churchId);
  }, [churchId]);

  return useFetchList<ChurchMembership>(fetchMembers);
};
