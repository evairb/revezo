export type ServiceType = "fixed" | "special";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Service {
  id: number;
  church: number;
  church_name: string;
  name: string;
  service_type: ServiceType;
  day_of_week: Weekday | null;
  date: string | null;
  time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePayload {
  church: number;
  name: string;
  service_type: ServiceType;
  day_of_week: Weekday | null;
  date: string | null;
  time: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}