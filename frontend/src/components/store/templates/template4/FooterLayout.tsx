"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";

export default function FooterLayout() {
  const { store, themeColors: theme } = useStore();
  const [email, setEmail] = useState("");

  if (!store) return null;

  return (
    <footer style={{ backgroundColor: theme.navBg, color: theme.navText }}>
      {/* Newsletter section */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black uppercase tracking-widest mb-3">
            Stay Updated
          </h3>
          <p className="text-sm opacity-70 mb-6">
            Subscribe for exclusive deals and new arrivals.
          </p>
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-900 bg-white outline-none"
            />
            <button
              className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-transform hover:scale-105"
              style={{
                backgroundColor: theme.primaryColor,
                color: theme.buttonText,
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Links section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-white/10 pt-10">
          <div>
            <h4 className="text-lg font-black uppercase tracking-wider mb-3">
              {store.storeName}
            </h4>
            <p className="text-sm opacity-60 leading-relaxed">
              {store.branding.tagline || "Bold products for bold people. Quality you can trust."}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-80">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
                >
                  Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10 py-4 text-center">
        <span className="text-xs font-bold opacity-50">
          &copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
