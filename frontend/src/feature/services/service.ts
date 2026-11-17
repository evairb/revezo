
import { api } from "../../shared/services/api/api";
import type { PaginatedResponse, Service, ServicePayload } from "./types";

export const getServices = async (): Promise<PaginatedResponse<Service>> => {
  const response = await api.get<PaginatedResponse<Service>>("/services/");
  return response.data;
};

export const createService = async (
  data: ServicePayload,
): Promise<Service> => {
  const response = await api.post<Service>("/services/", data);
  return response.data;
};

export const updateService = async (
  id: number,
  data: Partial<ServicePayload>,
): Promise<Service> => {
  const response = await api.patch<Service>(`/services/${id}/`, data);
  return response.data;
};

export const deactivateService = async (id: number): Promise<void> => {
  await api.delete(`/services/${id}/`);
};
