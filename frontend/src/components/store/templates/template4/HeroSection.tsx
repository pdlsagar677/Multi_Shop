"use client";
import Link from "next/link";
import { useStore } from "@/components/providers/StoreProvider";

export default function HeroSection() {
  const { store, themeColors: theme } = useStore();

  if (!store) return null;

  const hasBanner = !!store.branding.storeBanner;

  return (
    <section
      className="min-h-[60vh] flex items-center relative overflow-hidden"
      style={
        hasBanner
          ? { backgroundImage: `url(${store.branding.storeBanner})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: theme.bgColor }
      }
    >
      {hasBanner && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {hasBanner ? (
          // Banner mode — centered text over image
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight text-white">
              {store.storeName}
            </h1>
            <p className="text-lg opacity-80 text-white">
              {store.branding.tagline || "Bold style. Bold choices. Shop now."}
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider bg-white text-black transition-transform hover:scale-105"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          // Default — split layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div
              className="flex items-center justify-center rounded-3xl aspect-square max-h-[400px]"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}33, ${theme.secondaryColor})`,
              }}
            >
              <span
                className="text-[12rem] leading-none font-black select-none opacity-20"
                style={{ color: theme.primaryColor }}
              >
                {store.storeName[0].toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-6">
              <h1
                className="text-4xl sm:text-5xl font-black uppercase leading-tight"
                style={{ color: theme.textColor }}
              >
                {store.storeName}
              </h1>
              <p
                className="text-lg opacity-70"
                style={{ color: theme.textColor }}
              >
                {store.branding.tagline || "Bold style. Bold choices. Shop now."}
              </p>
              <div>
                <Link
                  href="/"
                  className="inline-block px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider transition-transform hover:scale-105"
                  style={{
                    backgroundColor: theme.buttonBg,
                    color: theme.buttonText,
                  }}
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
