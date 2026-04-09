"use client";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";
import { useCartStore } from "@/store/cartStore";

export default function NavbarLayout() {
  const { store, themeColors: theme } = useStore();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  if (!store) return null;

  const isCustomer = !user || user.role === "customer";
  const cartCount = isAuthenticated && isCustomer
    ? items.reduce((sum, i) => sum + i.quantity, 0)
    : 0;

  return (
    <nav
      style={{
        backgroundColor: theme.navBg,
        borderBottom: `3px solid ${theme.primaryColor}`,
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left — Cart */}
          <div className="flex items-center gap-2">
            {isCustomer && (
              <Link
                href="/cart"
                className="relative p-2 rounded-lg transition-colors"
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
            )}
          </div>

          {/* Center — Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {store.branding.logo ? (
              <img
                src={store.branding.logo}
                alt={store.storeName}
                className="h-8 object-contain"
              />
            ) : null}
            <span
              className="text-xl font-black uppercase tracking-widest"
              style={{ color: theme.navText }}
            >
              {store.storeName}
            </span>
          </Link>

          {/* Right — User + Mobile toggle */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href={user.role === "vendor" ? "/dashboard" : "/account"}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
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
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: theme.navText,
                }}
              >
                <User size={16} />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg"
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
            className="flex items-center gap-3 text-sm font-bold py-2.5 px-3 rounded-lg"
            style={{ color: theme.navText }}
          >
            Shop
          </Link>
          {isCustomer && (
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-bold py-2.5 px-3 rounded-lg"
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
          )}
          {user ? (
            <Link
              href={user.role === "vendor" ? "/dashboard" : "/account"}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm font-bold py-2.5 px-3 rounded-lg"
              style={{ color: theme.navText }}
            >
              <User size={16} /> My Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm font-bold py-2.5 px-3 rounded-lg"
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
