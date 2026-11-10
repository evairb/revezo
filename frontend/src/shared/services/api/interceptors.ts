
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { notifySessionExpired } from "./session";
import { getAccessToken, setAccessToken } from "./token";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshCallback = (token: string | null) => void;

export const setupInterceptors = (api: AxiosInstance) => {
  let isRefreshing = false;
  let refreshQueue: RefreshCallback[] = [];

  const getCsrfToken = async (): Promise<string> => {
    await api.get("/auth/csrf/");

    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("csrftoken="));

    if (!cookie) {
      throw new Error("Não foi possível obter o token CSRF.");
    }

    return decodeURIComponent(cookie.split("=").slice(1).join("="));
  };

  api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequest
        | undefined;

      const requestUrl = originalRequest?.url ?? "";

      const isAuthenticationRequest =
        requestUrl.includes("/auth/csrf/") ||
        requestUrl.includes("/auth/token/");

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isAuthenticationRequest
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${token}`;

            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const csrfToken = await getCsrfToken();

        const response = await api.post<{ access: string }>(
          "/auth/token/refresh/",
          {},
          {
            headers: {
              "X-CSRFToken": csrfToken,
            },
          }
        );

        const newAccessToken = response.data.access;

        setAccessToken(newAccessToken);

        refreshQueue.forEach((callback) => callback(newAccessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        notifySessionExpired();
        refreshQueue.forEach((callback) => callback(null));
        refreshQueue = [];

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
