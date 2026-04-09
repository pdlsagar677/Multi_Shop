"use client";
import { useEffect, useState } from "react";
import { Percent } from "lucide-react";
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Simple Centered Header */}
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Percent size={16} className="text-orange-500" />
          <h2
            className="text-lg font-semibold"
            style={{ color: theme.textColor }}
          >
            On Sale
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          {products.length} limited deals
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {products.map((product) => (
          <div key={product._id}>
            <ProductCard product={product} theme={theme} />
          </div>
        ))}
      </div>
    </section>
  );
}