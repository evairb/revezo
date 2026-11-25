
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface AdministeredMinistry {
  id: number;
  name: string;
}

export interface UserChurch {
  id: number;
  name: string;
  role: "master" | "admin" | "member";
  is_ministry_admin: boolean;
  administered_ministries: AdministeredMinistry[];
}
