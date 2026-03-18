import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
}

// ─────────────────────────────────────────
// useAuth hook
// All auth actions live here
// ─────────────────────────────────────────
export const useAuth = () => {
  const router = useRouter();
  const { setUser, clearAuth, setLoading, user, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Login ──
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data } = await api.post("/auth/login", credentials);

      setUser(data.user);

      // Main domain login is superadmin-only (backend enforces this)
      if (data.user.role === "superadmin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "vendor" && data.user.vendor?.subdomain) {
        // Fallback: redirect vendor to their subdomain
        window.location.href = `http://${data.user.vendor.subdomain}.localhost:3000/dashboard`;
      } else {
        router.push("/");
      }
    } catch (err: any) {
      // Vendor first login — redirect to change password
      if (err.response?.data?.requiresPasswordChange) {
        router.push(`/change-password?userId=${err.response.data.userId}`);
        return;
      }
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register (customer only) ──
  const register = async (data: RegisterData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await api.post("/auth/register", data);
      return res.data; // returns userId for OTP step
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Registration failed.";
      setError(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Verify OTP ──
  const verifyOTP = async (userId: string, otp: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await api.post("/auth/verify-otp", { userId, otp });
      router.push("/login?verified=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Resend OTP ──
  const resendOTP = async (userId: string) => {
    try {
      setError(null);
      await api.post("/auth/resend-otp", { userId });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  // ── Logout ──
  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/auth/logout");
    } catch {
      // Even if API fails, clear local state
    } finally {
      clearAuth();
      setLoading(false);
      router.push("/login");
    }
  };

  // ── Get current user from server ──
  const fetchMe = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    error,
    isSubmitting,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    fetchMe,
    setError,
  };
};