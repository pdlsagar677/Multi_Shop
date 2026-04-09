"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
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

  useEffect(() => {
    api.get(`/store/${subdomain}/products?featured=true&limit=8`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Star size={20} className="fill-yellow-400 text-yellow-400" />
        <h2 className="text-xl sm:text-2xl font-black" style={{ color: theme.textColor }}>
          Featured Products
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} theme={theme} />
        ))}
      </div>
    </section>
  );
}
