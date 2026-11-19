import { api } from "../../../shared/services/api/api";
import type { PaginatedResponse } from "../types";
import type { ChurchMembership, ChurchMembershipPayload, ChurchMembershipUpdatePayload, UserSearchResult } from "./types";

export const getChurchMembers = async (
  churchId: number,
): Promise<PaginatedResponse<ChurchMembership>> => {
  const response = await api.get<PaginatedResponse<ChurchMembership>>(
    "/churches/memberships/",
    {
      params: {
        church: churchId,
      },
    },
  );
  return response.data
}

export const searchChurchUsers = async (
  churchId: number,
  search: string,
): Promise<UserSearchResult[]> => {
  const response = await api.get<UserSearchResult[]>(
    "/churches/memberships/search-users/",
    {
      params: {
        church: churchId,
        email: search,
      },
    },
  );

  return response.data;
};

export const createChurchMembership = async (
  data: ChurchMembershipPayload,
): Promise<ChurchMembership> => {
  const response = await api.post<ChurchMembership>(
    "/churches/memberships/",
    data,
  );
  return response.data;
}

export const updateChurchMembership = async (
  id: number,
  data: ChurchMembershipUpdatePayload,
): Promise<ChurchMembership> => {
  const response = await api.patch<ChurchMembership>(
    `/churches/memberships/${id}/`,
    data,
  );
  return response.data
}