"use client";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export default function HeroSection() {
  const { store, themeColors: theme } = useStore();
  if (!store) return null;

  const hasBanner = !!store.branding.storeBanner;

  return (
    <section
      className="relative min-h-[5vh] flex items-center"
      style={
        hasBanner
          ? { backgroundImage: `url(${store.branding.storeBanner})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: theme.navBg }
      }
    >
      {hasBanner && <div className="absolute inset-0 bg-black/50" />}
      {!hasBanner && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div
            className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl animate-float"
            style={{ backgroundColor: `${theme.primaryColor}15` }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1
          className="text-4xl sm:text-6xl font-bold leading-tight mb-4 animate-fade-in"
          style={{ color: hasBanner ? "#ffffff" : theme.navText }}
        >
          {store.storeName}
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl mx-auto mb-8 animate-slide-up"
          style={{ color: hasBanner ? "#ffffff" : theme.navText, opacity: 0.8 }}
        >
          {store.branding.tagline || "Discover our curated collection of premium products."}
        </p>
        <a
          href="#all-products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 animate-slide-up"
          style={{
            backgroundColor: hasBanner ? "#ffffff" : theme.buttonBg,
            color: hasBanner ? "#000000" : theme.buttonText,
          }}
        >
          Explore Collection <ArrowRight size={16} />
        </a>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(10px, -10px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}