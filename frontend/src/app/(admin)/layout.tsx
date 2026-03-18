"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Users, Settings,
  LogOut, ShoppingBag, Menu, X, ChevronRight,
   Shield, Bell, Search, Grid,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Vendors", href: "/admin/vendors", icon: Store },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();
  const user = useAuthStore(s => s.user);

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? "fixed inset-0 z-50 flex" : "hidden lg:flex"}
      ${mobile && !mobileOpen ? "pointer-events-none" : ""}
    `}>
      {/* Overlay for mobile */}
      {mobile && (
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`
        relative flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 text-white transition-all duration-300 h-full
        ${mobile ? `w-80 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform shadow-2xl` : collapsed ? "w-20" : "w-72"}
      `}>
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

        {/* Logo with enhanced design */}
        <div className={`flex items-center gap-3 p-6 border-b border-gray-800/50 ${collapsed && !mobile ? "justify-center" : ""}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur-lg opacity-50" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-xl">
              <ShoppingBag size={20} className="text-white" />
            </div>
          </div>
          {(!collapsed || mobile) && (
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                MultiStore
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={10} className="text-amber-400" />
                <span className="text-[10px] font-medium text-gray-400">Admin Portal</span>
              </div>
            </div>
          )}
          {mobile && (
            <button 
              onClick={() => setMobileOpen(false)} 
              className="ml-auto w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav with enhanced styling */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                onClick={() => mobile && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${active 
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-lg shadow-orange-500/20" 
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }
                  ${collapsed && !mobile ? "justify-center" : ""}
                `}>
                <Icon size={20} className={`shrink-0 ${active ? "text-gray-900" : "text-gray-400 group-hover:text-white"}`} />
                {(!collapsed || mobile) && (
                  <>
                    <span className={`font-medium text-sm flex-1 ${active ? "text-gray-900" : ""}`}>{label}</span>
                    {active && (
                      <div className="w-1.5 h-6 bg-white rounded-full" />
                    )}
                  </>
                )}
                {/* Tooltip when collapsed */}
                {collapsed && !mobile && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-gray-700">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section with enhanced design */}
        <div className="p-4 border-t border-gray-800/50">
          {(!collapsed || mobile) && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-800/30 rounded-xl border border-gray-800/50">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-sm opacity-60" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                  <Shield size={10} className="text-amber-400" />
                  {user?.role || "Administrator"}
                </p>
              </div>
            </div>
          )}
          
          <button onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all group
              ${collapsed && !mobile ? "justify-center" : ""}
            `}>
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            {(!collapsed || mobile) && (
              <span className="font-medium text-sm">Sign Out</span>
            )}
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 transition-all border-2 border-gray-700 shadow-lg"
          >
            <ChevronRight size={12} className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />
      {/* Mobile sidebar */}
      <Sidebar mobile />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Top bar with enhanced design */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-3 flex items-center gap-4 shrink-0 sticky top-0 z-10">
          <button 
            onClick={() => setMobileOpen(true)} 
            className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb or page title could go here */}
          <div className="flex-1" />

          {/* Search bar - optional toggle */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Notification bell */}
          <button className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu trigger - simplified for header */}
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name || "Admin User"}</p>
              <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                <Shield size={10} className="text-amber-400" />
                {user?.role || "Administrator"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-200">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content with subtle background */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer - optional */}
        <footer className="px-6 py-3 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <p className="text-xs text-gray-400 text-center">
            MultiStore Admin Panel © 2026 • v2.0.0 By Sagar 
          </p>
        </footer>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}