
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