"use client";

import { useEffect, useRef } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearAuth, setLoading } = useAuthStore();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const fetchMe = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        clearAuth();
      }
    };

    fetchMe();
  }, []);

  return <>{children}</>;
};
