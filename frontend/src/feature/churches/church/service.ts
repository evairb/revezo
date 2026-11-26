import { api } from "../../../shared/services/api/api";
import type { Church, ChurchPayload } from "./types";
import type { PaginatedResponse } from "../../../shared/services/api/api";

export const getChurches = async (): Promise<PaginatedResponse<Church>> => {
  const response = await api.get<PaginatedResponse<Church>>("/churches/");

  return response.data;
};

export const createChurch = async (
  data: ChurchPayload,
): Promise<Church> => {
  const response = await api.post<Church>("/churches/", data);

  return response.data;
};

export const updateChurch = async (
  id: number,
  data: Partial<ChurchPayload>,
): Promise<Church> => {
  const response = await api.patch<Church>(`/churches/${id}/`, data);

  return response.data;
};