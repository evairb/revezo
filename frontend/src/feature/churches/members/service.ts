import { api } from "../../../shared/services/api/api";
import type { PaginatedResponse } from "../types";
import type {
  ChurchMembership,
  ChurchMembershipPayload,
  ChurchMembershipUpdatePayload,
  UserSearchResult,
  ChurchMemberCreatePayload,
} from "./types";

export const getChurchMembers = async (
  churchId: number,
  status: "active" | "inactive" | "all" = "active",
): Promise<PaginatedResponse<ChurchMembership>> => {
  const response = await api.get<PaginatedResponse<ChurchMembership>>(
    "/churches/memberships/",
    {
      params: {
        church: churchId,
        status,
      },
    },
  );

  return response.data;
};

export const getChurchMember = async (
  memberId: number,
): Promise<ChurchMembership> => {
  const response = await api.get<ChurchMembership>(
    `/churches/memberships/${memberId}/`,
  );

  return response.data;
};

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

export const createChurchMember = async (
  data: ChurchMemberCreatePayload,
): Promise<ChurchMembership> => {
  const response = await api.post(
    "/churches/memberships/create-member/",
    data,
  )

  return response.data;
}