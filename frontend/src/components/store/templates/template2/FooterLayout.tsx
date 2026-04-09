"use client";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export default function FooterLayout() {
  const { store, themeColors: theme } = useStore();

  if (!store) return null;

  return (
    <footer className="mt-auto" style={{ backgroundColor: theme.navBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Column 1 — Store info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {store.branding.logo ? (
                <img
                  src={store.branding.logo}
                  alt={store.storeName}
                  className="h-8 object-contain"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.buttonText,
                  }}
                >
                  {store.storeName[0].toUpperCase()}
                </div>
              )}
              <span
                className="text-lg font-black tracking-tight"
                style={{ color: theme.navText }}
              >
                {store.storeName}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed opacity-60"
              style={{ color: theme.navText }}
            >
              {store.branding.tagline || "Your one-stop shop for quality products."}
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-4"
              style={{ color: theme.navText }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Shop" },
                { href: "/cart", label: "Cart" },
                { href: "/account", label: "Account" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: theme.navText }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-4"
              style={{ color: theme.navText }}
            >
              Contact
            </h3>
            <ul className="space-y-2.5">
              {store.contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail size={14} style={{ color: theme.navText, opacity: 0.6 }} />
                  <a
                    href={`mailto:${store.contact?.email}`}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: theme.navText }}
                  >
                    {store.contact?.email}
                  </a>
                </li>
              )}
              {store.contact?.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} style={{ color: theme.navText, opacity: 0.6 }} />
                  <a
                    href={`tel:${store.contact?.phone}`}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: theme.navText }}
                  >
                    {store.contact?.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: `${theme.navText}1A` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs opacity-50" style={{ color: theme.navText }}>
            &copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.
          </p>
          <p className="text-xs opacity-40" style={{ color: theme.navText }}>
            Powered by Multi-Tenant SaaS
          </p>
        </div>
      </div>
    </footer>
  );
}
