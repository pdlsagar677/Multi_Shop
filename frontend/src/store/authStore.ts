import { create } from "zustand";
import { devtools } from "zustand/middleware";


export type Role = "superadmin" | "vendor" | "customer";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  vendorId: string | null;
  phone?: string | null;
  age?: number | null;
  vendor?: { subdomain: string; storeName: string; theme: string } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}


export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // true initially so UI waits for fetchMe

      setUser: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }, false, "setUser"),

      clearAuth: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }, false, "clearAuth"),

      setLoading: (loading) =>
        set({ isLoading: loading }, false, "setLoading"),
    }),
    { name: "AuthStore" }
  )
);