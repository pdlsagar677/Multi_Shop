"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import api from "@/lib/axios";

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

interface FeaturedSectionProps {
  subdomain: string;
  theme: any;
}

export default function FeaturedSection({ subdomain, theme }: FeaturedSectionProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/store/${subdomain}/products?featured=true&limit=1`)
      .then(({ data }) => {
        const products = data.products || [];
        setProduct(products.length > 0 ? products[0] : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || !product) return null;

  const displayPrice = product.effectivePrice ?? product.price;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
      <h2
        className="text-sm tracking-[0.3em] uppercase mb-10 text-center"
        style={{ color: theme.textColor }}
      >
        Spotlight
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={60} className="text-gray-200" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {product.category && (
            <span
              className="text-xs tracking-[0.2em] uppercase opacity-50"
              style={{ color: theme.textColor }}
            >
              {product.category}
            </span>
          )}
          <h3
            className="text-2xl sm:text-3xl font-light tracking-wide"
            style={{ color: theme.textColor }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p
              className="text-sm opacity-50 leading-relaxed line-clamp-4"
              style={{ color: theme.textColor }}
            >
              {product.description}
            </p>
          )}
          <span
            className="text-lg font-light"
            style={{ color: theme.textColor }}
          >
            Rs.{displayPrice.toFixed(2)}
          </span>
          <div>
            <Link
              href={`/product/${product._id}`}
              className="inline-block text-xs tracking-[0.2em] uppercase py-2 transition-opacity hover:opacity-70"
              style={{
                color: theme.primaryColor,
                borderBottom: `1px solid ${theme.primaryColor}`,
              }}
            >
              View Product
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
