"use client";
import Link from "next/link";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
    <>
      <nav
        className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative"
        style={{ backgroundColor: theme.navBg }}
      >
        {/* Left — Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: theme.navText }}
        >
          <Menu size={20} />
        </button>

        {/* Center — Store name */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 tracking-[0.3em] uppercase text-sm"
          style={{ color: theme.navText }}
        >
          {store.storeName}
        </Link>

        {/* Right — Search + Cart */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.navText }}
          >
            <Search size={18} />
          </button>
          {isCustomer && (
            <Link
              href="/cart"
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: theme.navText }}
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
      </nav>

      {/* Full-screen overlay menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: theme.navBg }}
        >
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg"
            style={{ color: theme.navText }}
          >
            <X size={24} />
          </button>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-2xl tracking-[0.2em] uppercase font-light transition-opacity hover:opacity-70"
            style={{ color: theme.navText }}
          >
            Shop
          </Link>
          {isCustomer && (
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="text-2xl tracking-[0.2em] uppercase font-light transition-opacity hover:opacity-70 flex items-center gap-3"
              style={{ color: theme.navText }}
            >
              Cart
              {cartCount > 0 && (
                <span
                  className="text-sm px-2 py-0.5 rounded-full"
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
              onClick={() => setMenuOpen(false)}
              className="text-2xl tracking-[0.2em] uppercase font-light transition-opacity hover:opacity-70"
              style={{ color: theme.navText }}
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-2xl tracking-[0.2em] uppercase font-light transition-opacity hover:opacity-70"
              style={{ color: theme.navText }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </>
  );
}
