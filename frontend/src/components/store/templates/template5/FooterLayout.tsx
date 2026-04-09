"use client";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export default function FooterLayout() {
  const { store, themeColors: theme } = useStore();

  if (!store) return null;

  return (
    <footer style={{ backgroundColor: theme.navBg, color: theme.navText }}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <div className="text-center mb-10">
          <h3 className="text-sm tracking-[0.3em] uppercase mb-4 opacity-80">
            Our Story
          </h3>
          <p className="text-sm opacity-50 max-w-lg mx-auto leading-relaxed">
            {store.branding.tagline ||
              "We believe in timeless elegance and thoughtful design. Every piece in our collection is curated with care."}
          </p>
        </div>

        {/* Separator */}
        <div
          className="w-16 h-px mx-auto mb-10"
          style={{ backgroundColor: `${theme.navText}33` }}
        />

        {/* Bottom */}
        <div className="text-center">
          <span className="tracking-[0.3em] uppercase text-sm">
            {store.storeName}
          </span>

          {/* Social icons */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="opacity-40 hover:opacity-70 transition-opacity cursor-pointer">
              <Instagram size={18} />
            </span>
            <span className="opacity-40 hover:opacity-70 transition-opacity cursor-pointer">
              <Twitter size={18} />
            </span>
            <span className="opacity-40 hover:opacity-70 transition-opacity cursor-pointer">
              <Facebook size={18} />
            </span>
          </div>

          {/* Copyright */}
          <p className="text-xs opacity-30 mt-6">
            &copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
