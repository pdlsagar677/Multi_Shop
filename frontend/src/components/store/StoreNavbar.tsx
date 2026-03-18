"use client";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";
import { useCartStore } from "@/store/cartStore";

export default function StoreNavbar() {
  const { store, themeColors: theme } = useStore();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!store) return null;

  const cartCount = user
    ? items
        .filter((i) => i.vendorSubdomain === store.subdomain)
        .reduce((sum, i) => sum + i.quantity, 0)
    : 0;

  return (
    <nav style={{ backgroundColor: theme.navBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {store.branding.logo ? (
              <img
                src={store.branding.logo}
                alt={store.storeName}
                className="h-8 object-contain"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shadow-sm"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonText,
                }}
              >
                {store.storeName[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-lg font-black tracking-tight hidden sm:inline"
              style={{ color: theme.navText }}
            >
              {store.storeName}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: theme.navText }}
            >
              Shop
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl transition-colors"
              style={{ color: theme.navText }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-bold leading-none"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.buttonText,
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <Link
                href={user.role === "vendor" ? "/dashboard" : "/account"}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: theme.navText,
                }}
              >
                <User size={16} />
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: theme.navText,
                }}
              >
                <User size={16} />
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl"
              style={{ color: theme.navText }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-1"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors"
            style={{ color: theme.navText }}
          >
            Shop
          </Link>
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors"
            style={{ color: theme.navText }}
          >
            <span className="flex items-center gap-3">
              <ShoppingCart size={16} /> Cart
            </span>
            {cartCount > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonText,
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              href={user.role === "vendor" ? "/dashboard" : "/account"}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors"
              style={{ color: theme.navText }}
            >
              <User size={16} /> My Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors"
              style={{ color: theme.navText }}
            >
              <User size={16} /> Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
