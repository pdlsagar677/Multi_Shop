"use client";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";
import { useCartStore } from "@/store/cartStore";

export default function StoreNavbar() {
  const { store, themeColors: theme } = useStore();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch cart when user is authenticated
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
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: theme.navBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {store.branding.logo ? (
              <img
                src={store.branding.logo}
                alt={store.storeName}
                className="h-7 w-auto object-contain"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonText,
                }}
              >
                {store.storeName[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-base font-bold tracking-tight hidden sm:inline"
              style={{ color: theme.navText }}
            >
              {store.storeName}
            </span>
          </Link>

          {/* Desktop nav - Simple */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: theme.navText }}
            >
              Shop
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            {isCustomer && (
              <Link
                href="/cart"
                className="relative p-2 rounded-lg transition-opacity hover:opacity-80"
                style={{ color: theme.navText }}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
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

            {/* User */}
            {user ? (
              <Link
                href={user.role === "vendor" ? "/dashboard" : "/account"}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: theme.navText,
                }}
              >
                <User size={14} />
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: theme.navText,
                }}
              >
                <User size={14} />
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ color: theme.navText }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{ 
            borderColor: "rgba(255,255,255,0.1)",
            backgroundColor: theme.navBg
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-lg transition-opacity hover:opacity-80"
            style={{ color: theme.navText }}
          >
            Shop
          </Link>
          {isCustomer && (
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-medium py-2.5 px-3 rounded-lg transition-opacity hover:opacity-80"
              style={{ color: theme.navText }}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={16} /> Cart
              </span>
              {cartCount > 0 && (
                <span
                  className="min-w-[18px] h-4 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold"
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
              className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-lg transition-opacity hover:opacity-80"
              style={{ color: theme.navText }}
            >
              <User size={16} /> My Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-lg transition-opacity hover:opacity-80"
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