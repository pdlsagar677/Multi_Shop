"use client";
import { useEffect, useState } from "react";
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

interface SaleSectionProps {
  subdomain: string;
  theme: any;
}

export default function SaleSection({ subdomain, theme }: SaleSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/store/${subdomain}/products?onSale=true&limit=6`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
      {/* Top border */}
      <div
        className="h-px w-full mb-10"
        style={{ backgroundColor: theme.borderColor }}
      />

      <h2
        className="text-sm tracking-[0.3em] uppercase mb-10 text-center"
        style={{ color: theme.textColor }}
      >
        On Sale
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} theme={theme} />
        ))}
      </div>

      {/* Bottom border */}
      <div
        className="h-px w-full mt-10"
        style={{ backgroundColor: theme.borderColor }}
      />
    </section>
  );
}
