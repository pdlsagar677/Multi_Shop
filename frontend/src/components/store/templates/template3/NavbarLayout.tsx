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
  const cartCount =
    isAuthenticated && isCustomer
      ? items.reduce((sum, i) => sum + i.quantity, 0)
      : 0;

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ 
        backgroundColor: theme.bgColor, 
        borderColor: theme.borderColor 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14">
          {/* Left — Cart (customers only) */}
          <div className="flex items-center gap-2 w-32">
            {isCustomer && (
              <Link
                href="/cart"
                className="relative p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: theme.textColor }}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold leading-none"
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

          {/* Center — Logo / Store Name */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 shrink-0"
          >
            {store.branding.logo ? (
              <img
                src={store.branding.logo}
                alt={store.storeName}
                className="h-7 object-contain"
              />
            ) : (
              <span
                className="text-base font-black tracking-tight"
                style={{ color: theme.textColor }}
              >
                {store.storeName}
              </span>
            )}
          </Link>

          {/* Right — User / Sign In */}
          <div className="flex items-center gap-2 w-32 justify-end">
            {user ? (
              <Link
                href={user.role === "vendor" ? "/dashboard" : "/account"}
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: theme.textColor }}
              >
                <User size={16} />
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: theme.textColor }}
              >
                <User size={16} />
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: theme.textColor }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{
            borderColor: theme.borderColor,
            backgroundColor: theme.bgColor,
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 text-sm font-semibold py-2 px-3 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: theme.textColor }}
          >
            Shop
          </Link>
          {isCustomer && (
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-semibold py-2 px-3 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: theme.textColor }}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={16} /> Cart
              </span>
              {cartCount > 0 && (
                <span
                  className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
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
              className="flex items-center gap-3 text-sm font-semibold py-2 px-3 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: theme.textColor }}
            >
              <User size={16} /> My Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold py-2 px-3 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: theme.textColor }}
            >
              <User size={16} /> Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}