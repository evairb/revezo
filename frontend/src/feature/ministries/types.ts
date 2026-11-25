
export type MinistryRole = "member" | "admin";

export interface Ministry {
  id: number;
  church: number;
  church_name: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MinistryMembership {
  id: number;
  user: number;
  user_email: string;
  ministry: number;
  ministry_name: string;
  role: MinistryRole;
  is_active: boolean;
  joined_at: string;
}

export interface MinistryPayload {
  church: number;
  name: string;
}

export interface MinistryUpdatePayload {
  name?: string;
  is_active?: boolean;
}

export interface MinistryMembershipPayload {
  user: number;
  ministry: number;
  role?: MinistryRole;
}

export interface MinistryMembershipUpdatePayload {
  role?: MinistryRole;
  is_active?: boolean;
}