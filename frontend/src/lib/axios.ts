import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends httpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────
// Request interceptor — attach subdomain header
// ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const parts = window.location.hostname.split(".");
    if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www") {
      config.headers["x-vendor-subdomain"] = parts[0];
    }
  }
  return config;
});

// ─────────────────────────────────────────
// Response interceptor
// If access token is expired (401), silently
// call /refresh then retry the original request
// ─────────────────────────────────────────
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    // Skip refresh attempt for auth endpoints (me, refresh, login) to avoid loops
    const isAuthEndpoint = originalRequest.url?.match(/\/auth\/(me|refresh|login|register|logout)/);
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Import here to avoid circular dependency
import { useAuthStore } from "@/store/authStore";

export default api;