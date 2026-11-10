
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  login as authLogin,
  logout as authLogout,
  refreshSession,
  getCurrentUser,
} from "../../feature/auth/auth.service";

import { setSessionExpiredHandler } from "../../shared/services/api/session";
import { setAccessToken } from "../../shared/services/api/token";

import type {
  AuthUser,
  LoginCredentials,
} from "../../feature/auth/auth.types";

interface AuthContextData {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializationRef = useRef<Promise<AuthUser | null> | null>(null);
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setAccessToken(null);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  // Recupera a sessão existente
  useEffect(() => {
    let active = true;

    if (!initializationRef.current) {
      initializationRef.current = refreshSession()
        .then(() => getCurrentUser())
        .catch(() => {
          setAccessToken(null);
          return null;
        });
    }

    initializationRef.current.then((currentUser) => {
      if (active) {
        setUser(currentUser);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      await authLogin(credentials);

      const currentUser = await getCurrentUser();

      setUser(currentUser);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authLogout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext deve ser utilizado dentro de AuthProvider."
    );
  }

  return context;
};
