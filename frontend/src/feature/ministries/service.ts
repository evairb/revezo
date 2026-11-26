
import { api, type PaginatedResponse } from "../../shared/services/api/api";

import type {
  Ministry,
  MinistryMembership,
  MinistryPayload,
  MinistryUpdatePayload,
  MinistryMembershipPayload,
  MinistryMembershipUpdatePayload,
  MinistryFunction,
  MinistryFunctionPayload,
  MinistryFunctionUpdatePayload,
} from "./types";

// MINISTÉRIOS

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

// FUNÇÕES DO MINISTÉRIO

export const getMinistryFunctions = async (
  ministryId: number,
  status?: "active" | "inactive",
) => {
  const response = await api.get<PaginatedResponse<MinistryFunction>>(
    "/ministries/functions/",
    {
      params: {
        ministry: ministryId,
        ...(status && { status }),
      },
    },
  );

  return response.data;
};

export const createMinistryFunction = async (
  data: MinistryFunctionPayload,
) => {
  const response = await api.post<MinistryFunction>(
    "/ministries/functions/",
    data,
  );

  return response.data;
};

export const updateMinistryFunction = async (
  functionId: number,
  data: MinistryFunctionUpdatePayload,
) => {
  const response = await api.patch<MinistryFunction>(
    `/ministries/functions/${functionId}/`,
    data,
  );

  return response.data;
};

export const deleteMinistryFunction = async (functionId: number) => {
  const response = await api.delete(
    `/ministries/functions/${functionId}/`,
  );

  return response.data;
};

// INTEGRANTES DO MINISTÉRIO

export const getMinistryMemberships = async (
  ministryId: number,
  status?: "active" | "inactive",
) => {
  const response = await api.get<PaginatedResponse<MinistryMembership>>(
    "/ministries/memberships/",
    {
      params: {
        ministry: ministryId,
        ...(status && { status }),
      },
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
