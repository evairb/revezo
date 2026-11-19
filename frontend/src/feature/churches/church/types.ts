export interface Church {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChurchPayload {
  name: string;
  is_active?: boolean;
}