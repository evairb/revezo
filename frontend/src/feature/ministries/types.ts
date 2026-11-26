
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

export interface MinistryFunction {
  id: number;
  ministry: number;
  ministry_name: string;
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
  functions: number[];
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

export interface MinistryFunctionPayload {
  ministry: number;
  name: string;
}

export interface MinistryFunctionUpdatePayload {
  name?: string;
  is_active?: boolean;
}

export interface MinistryMembershipPayload {
  user: number;
  ministry: number;
  role?: MinistryRole;
  functions?: number[];
}

export interface MinistryMembershipUpdatePayload {
  role?: MinistryRole;
  is_active?: boolean;
  functions?: number[];
}
