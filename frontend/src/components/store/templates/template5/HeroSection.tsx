"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/components/providers/StoreProvider";

export default function HeroSection() {
  const { store, themeColors: theme } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % 3);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (!store) return null;

  const hasBanner = !!store.branding.storeBanner;

  const slides = [
    {
      heading: store.storeName,
      subtext: store.branding.tagline || "Curated elegance for every occasion.",
      cta: "Explore Collection",
      gradient: hasBanner ? undefined : `linear-gradient(135deg, ${theme.primaryColor}22, ${theme.secondaryColor}, ${theme.bgColor})`,
    },
    {
      heading: "New Arrivals",
      subtext: "Discover our latest curated selections.",
      cta: "Shop New",
      gradient: hasBanner ? undefined : `linear-gradient(45deg, ${theme.secondaryColor}, ${theme.primaryColor}18, ${theme.bgColor})`,
    },
    {
      heading: "Free Shipping",
      subtext: "Complimentary delivery on all orders.",
      cta: "Shop Now",
      gradient: hasBanner ? undefined : `linear-gradient(180deg, ${theme.bgColor}, ${theme.secondaryColor}, ${theme.primaryColor}15)`,
    },
  ];

  return (
    <section
      className="relative min-h-[65vh] overflow-hidden"
      style={
        hasBanner
          ? { backgroundImage: `url(${store.branding.storeBanner})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: theme.bgColor }
      }
    >
      {hasBanner && <div className="absolute inset-0 bg-black/50" />}

      {slides.map((slide, idx) => (
        <div
          key={idx}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out"
          style={{
            background: slide.gradient,
            opacity: activeSlide === idx ? 1 : 0,
            pointerEvents: activeSlide === idx ? "auto" : "none",
          }}
        >
          <div className="text-center px-4 max-w-xl mx-auto">
            <h1
              className="text-3xl sm:text-5xl tracking-[0.15em] uppercase font-light mb-4"
              style={{ color: hasBanner ? "#ffffff" : theme.textColor }}
            >
              {slide.heading}
            </h1>
            <p
              className="text-sm sm:text-base tracking-wide opacity-60 mb-8"
              style={{ color: hasBanner ? "#ffffff" : theme.textColor }}
            >
              {slide.subtext}
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 text-xs tracking-[0.2em] uppercase transition-transform hover:scale-105"
              style={{
                backgroundColor: hasBanner ? "#ffffff" : theme.buttonBg,
                color: hasBanner ? "#000000" : theme.buttonText,
              }}
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: activeSlide === idx ? (hasBanner ? "#ffffff" : theme.primaryColor) : (hasBanner ? "#ffffff55" : `${theme.textColor}33`),
              transform: activeSlide === idx ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
