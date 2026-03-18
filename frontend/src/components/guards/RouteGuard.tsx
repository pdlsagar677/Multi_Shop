"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, Role } from "@/store/authStore";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function RouteGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!allowedRoles.includes(user!.role)) {
      if (user!.role === "superadmin") router.replace("/admin/dashboard");
      else if (user!.role === "vendor") router.replace("/dashboard");
      else router.replace("/");
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !allowedRoles.includes(user!.role)) return null;

  return <>{children}</>;
}
