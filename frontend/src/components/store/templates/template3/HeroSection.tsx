"use client";
import { ArrowDown } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export default function HeroSection() {
  const { store, themeColors: theme } = useStore();

  if (!store) return null;

  const hasBanner = !!store.branding.storeBanner;

  if (hasBanner) {
    return (
      <section
        className="relative overflow-hidden min-h-[50vh] flex items-center"
        style={{ backgroundImage: `url(${store.branding.storeBanner})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {store.storeName}
          </h1>
          {store.branding.tagline && (
            <p className="text-lg text-white/70 mt-2">{store.branding.tagline}</p>
          )}
          <a
            href="#all-products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-bold text-sm bg-white text-black transition-all hover:opacity-90"
          >
            Shop Now <ArrowDown size={16} />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-4xl sm:text-5xl font-black tracking-tight"
        style={{ color: theme.textColor }}
      >
        {store.storeName}
      </h1>
      {store.branding.tagline && (
        <p className="text-lg text-gray-500 mt-2">{store.branding.tagline}</p>
      )}
      <div
        className="mt-8"
        style={{ borderBottom: `1px solid ${theme.borderColor}` }}
      />
    </section>
  );
}
