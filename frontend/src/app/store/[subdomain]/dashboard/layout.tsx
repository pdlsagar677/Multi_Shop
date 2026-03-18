"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Settings, LogOut, Menu, X, ChevronRight, Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";
import api from "@/lib/axios";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { store, themeColors: theme } = useStore();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "vendor")) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    router.push("/login");
  };

  if (isLoading || !user || user.role !== "vendor") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin" style={{ color: theme.primaryColor }} />
      </div>
    );
  }

  // Extract the base path for matching (e.g., /store/vendor1/dashboard -> /dashboard)
  const pathSuffix = pathname.replace(/^\/store\/[^/]+/, "");

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`
      ${mobile ? "fixed inset-0 z-50 flex" : "hidden lg:flex"}
      ${mobile && !mobileOpen ? "pointer-events-none" : ""}
    `}
    >
      {mobile && (
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${mobileOpen ? "opacity-40" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`
        relative flex flex-col text-white transition-all duration-300 h-full
        ${mobile ? `w-72 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform` : collapsed ? "w-20" : "w-64"}
      `}
        style={{ backgroundColor: theme.navBg }}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-3 p-5 border-b border-white/10 ${collapsed && !mobile ? "justify-center" : ""}`}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black"
            style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
          >
            {store?.storeName?.[0]?.toUpperCase() || "S"}
          </div>
          {(!collapsed || mobile) && (
            <span className="text-lg font-black tracking-tight" style={{ color: theme.navText }}>
              {store?.storeName || "My Store"}
            </span>
          )}
          {mobile && (
            <button onClick={() => setMobileOpen(false)} className="ml-auto text-white/60 hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathSuffix === href || (href !== "/dashboard" && pathSuffix.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => mobile && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
                  ${collapsed && !mobile ? "justify-center" : ""}
                `}
                style={{
                  backgroundColor: active ? theme.primaryColor : "transparent",
                  color: active ? theme.buttonText : "rgba(255,255,255,0.6)",
                }}
              >
                <Icon size={20} className="shrink-0" />
                {(!collapsed || mobile) && <span className="font-medium text-sm">{label}</span>}
                {(!collapsed || mobile) && active && <ChevronRight size={16} className="ml-auto" />}
                {collapsed && !mobile && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          {(!collapsed || mobile) && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
              >
                {user?.name?.[0]?.toUpperCase() || "V"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all
              ${collapsed && !mobile ? "justify-center" : ""}`}
          >
            <LogOut size={20} className="shrink-0" />
            {(!collapsed || mobile) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center transition-all border border-white/20"
            style={{ backgroundColor: theme.navBg, color: theme.navText }}
          >
            <ChevronRight size={12} className={`transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <Sidebar mobile />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
            >
              {user?.name?.[0]?.toUpperCase() || "V"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">Vendor</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
