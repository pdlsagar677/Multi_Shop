"use client";
import { ArrowDown } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export default function HeroSection() {
  const { store, themeColors: theme } = useStore();
  if (!store) return null;

  const hasBanner = !!store.branding.storeBanner;

  return (
    <section
      className="relative overflow-hidden"
      style={
        hasBanner
          ? { backgroundImage: `url(${store.branding.storeBanner})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: theme.navBg }
      }
    >
      {hasBanner && <div className="absolute inset-0 bg-black/50" />}
      {!hasBanner && (
        <>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: theme.navText }} />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: theme.navText }} />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4" style={{ color: hasBanner ? "#ffffff" : theme.navText }}>
          Welcome to {store.storeName}
        </h1>
        <p className="text-base sm:text-lg max-w-lg mx-auto opacity-70 mb-6" style={{ color: hasBanner ? "#ffffff" : theme.navText }}>
          {store.branding.tagline || "Discover our amazing collection of products."}
        </p>
        <a href="#all-products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5" style={{ backgroundColor: hasBanner ? "#ffffff" : theme.buttonBg, color: hasBanner ? "#000000" : theme.buttonText }}>
          Shop Now <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}
