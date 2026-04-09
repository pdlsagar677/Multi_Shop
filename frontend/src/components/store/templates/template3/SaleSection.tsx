"use client";
import { useEffect, useState } from "react";
import { Tag, ArrowRight, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
  discountPercent?: number;
  isFeatured?: boolean;
  effectivePrice?: number;
}

interface SaleSectionProps {
  subdomain: string;
  theme: any;
}

export default function SaleSection({ subdomain, theme }: SaleSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/store/${subdomain}/products?onSale=true&limit=8`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || products.length === 0) return null;

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimalist Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 mb-3">
            <Tag size={14} />
            <span>Limited Time</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: theme.textColor }}>
            Seasonal <span className="font-bold" style={{ color: theme.primaryColor }}>Sale</span>
          </h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto mt-4" />
          <p className="text-gray-500 text-sm mt-4">
            Exclusive offers on our curated selection
          </p>
        </div>

        {/* Elegant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="group"
            >
              <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-50">
                <div className="aspect-square">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                {product.discountPercent && (
                  <div className="absolute top-3 left-3 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      -{product.discountPercent}%
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>
              
              <h3 className="font-medium text-sm mb-1 line-clamp-1" style={{ color: theme.textColor }}>
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold" style={{ color: theme.primaryColor }}>
                  ${product.effectivePrice?.toFixed(2) || product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/sale"
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
            style={{ color: theme.primaryColor }}
          >
            View All Sale Items <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}