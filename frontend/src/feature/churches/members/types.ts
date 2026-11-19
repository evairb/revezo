export type ChurchRole = "member" | "admin";

export interface ChurchMembership {
  id: number;
  user: number;
  user_email: string;
  church: number;
  church_name: string;
  role: ChurchRole;
  is_active: boolean;
  joined_at: string;
}

export interface ChurchMembershipPayload {
  user: number;
  church: number;
  role?: ChurchRole;
}

export interface ChurchMembershipUpdatePayload {
  role?: ChurchRole;
  is_active?: boolean;
}

export interface UserSearchResult {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}
