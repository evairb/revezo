
import axios from "axios";

import { api } from "../../shared/services/api/api";
import { setAccessToken } from "../../shared/services/api/token";

import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
} from "./auth.types";

// Obtém o cookie CSRF
const getCsrfToken = async (): Promise<string> => {
  await api.get("/auth/csrf/");

  const csrfCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrftoken="));

  if (!csrfCookie) {
    throw new Error("Não foi possível obter o token CSRF.");
  }

  return decodeURIComponent(
    csrfCookie.split("=").slice(1).join("=")
  );
};

// Login
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const csrfToken = await getCsrfToken();

  const response = await api.post<AuthResponse>(
    "/auth/token/",
    credentials,
    {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    }
  );

  setAccessToken(response.data.access);

  return response.data;
};

// Renovação da sessão
export const refreshSession = async (): Promise<AuthResponse> => {
  const csrfToken = await getCsrfToken();

  const response = await api.post<AuthResponse>(
    "/auth/token/refresh/",
    {},
    {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    }
  );

  setAccessToken(response.data.access);

  return response.data;
};

// Consulta do usuário autenticado
export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>("/auth/me/");

  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();

    await api.post(
      "/auth/token/blacklist/",
      {},
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
  } finally {
    setAccessToken(null);
  }
};

// Extrai mensagens de erro da API
export const getAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.detail) {
      return data.detail;
    }

    if (data?.email?.[0]) {
      return data.email[0];
    }

    if (data?.password?.[0]) {
      return data.password[0];
    }

    if (error.response?.status === 401) {
      return "E-mail ou senha inválidos.";
    }

    if (!error.response) {
      return "Não foi possível conectar ao servidor.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
};
