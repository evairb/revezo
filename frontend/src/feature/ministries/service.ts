import { api, type PaginatedResponse } from "../../shared/services/api/api";

import type { 
  Ministry,
  MinistryMembership,
  MinistryPayload,
  MinistryUpdatePayload,
  MinistryMembershipPayload,
  MinistryMembershipUpdatePayload
} from "./types";

export const getMinistries = async (churchId: number) => {
  const response = await api.get<PaginatedResponse<Ministry>>(
    "/ministries/",
    {
      params: { church: churchId },
    },
  );

  return response.data;
};

export const createMinistry = async (data: MinistryPayload) => {
  const response = await api.post<Ministry>("/ministries/", data);
  return response.data;
};

export const updateMinistry = async (
  ministryId: number,
  data: MinistryUpdatePayload,
) => {
  const response = await api.patch<Ministry>(
    `/ministries/${ministryId}/`,
    data,
  );

  return response.data;
};

export const getMinistryMemberships = async (ministryId: number) => {
  const response = await api.get<PaginatedResponse<MinistryMembership>>(
    "/ministries/memberships/",
    {
      params: { ministry: ministryId },
    },
  );

  return response.data;
};

export const createMinistryMembership = async (
  data: MinistryMembershipPayload,
) => {
  const response = await api.post<MinistryMembership>(
    "/ministries/memberships/",
    data,
  );

  return response.data;
};

export const updateMinistryMembership = async (
  membershipId: number,
  data: MinistryMembershipUpdatePayload,
) => {
  const response = await api.patch<MinistryMembership>(
    `/ministries/memberships/${membershipId}/`,
    data,
  );

  return response.data;
};