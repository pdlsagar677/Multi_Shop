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
    api.get(`/store/${subdomain}/products?onSale=true&limit=8`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
          <Percent size={16} className="text-red-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black" style={{ color: theme.textColor }}>
          On Sale
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
