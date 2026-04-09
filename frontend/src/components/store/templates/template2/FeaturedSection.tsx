"use client";
import { useEffect, useState, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
  discountPercent?: number;
  isFeatured?: boolean;
  effectivePrice?: number;
}

interface FeaturedSectionProps {
  subdomain: string;
  theme: any;
}

export default function FeaturedSection({ subdomain, theme }: FeaturedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get(`/store/${subdomain}/products?featured=true&limit=8`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const amount = direction === "left" ? -scrollAmount : scrollAmount;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Star size={16} className="fill-yellow-400 text-yellow-400 sm:hidden" />
          <Star size={18} className="fill-yellow-400 text-yellow-400 hidden sm:block" />
          <h2
            className="text-base sm:text-lg font-semibold"
            style={{ color: theme.textColor }}
          >
            Featured Products
          </h2>
          <span className="text-xs text-gray-400 hidden sm:inline">|</span>
          <span className="text-xs text-gray-500 hidden sm:inline">
            {products.length} items
          </span>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: `${theme.secondaryColor}20`,
              color: theme.textColor,
            }}
          >
            <ChevronLeft size={14} className="sm:hidden" />
            <ChevronLeft size={16} className="hidden sm:block" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: `${theme.secondaryColor}20`,
              color: theme.textColor,
            }}
          >
            <ChevronRight size={14} className="sm:hidden" />
            <ChevronRight size={16} className="hidden sm:block" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container - Fully responsive */}
      <div className="relative max-w-7xl mx-auto">
        <div
          ref={scrollRef}
          className="overflow-x-auto flex gap-3 sm:gap-4 pb-4 scroll-smooth"
          style={{ 
            scrollbarWidth: "thin",
            msOverflowStyle: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {products.map((product) => (
            <div 
              key={product._id} 
              className="w-[170px] xs:w-[190px] sm:w-[210px] md:w-[230px] lg:w-[240px] flex-shrink-0"
            >
              <ProductCard product={product} theme={theme} />
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for better UX */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none hidden sm:block" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none hidden sm:block" />
      </div>
    </section>
  );
}