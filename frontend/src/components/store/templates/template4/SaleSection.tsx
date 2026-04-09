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
      .get(`/store/${subdomain}/products?onSale=true&limit=4`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || products.length === 0) return null;

  return (
    <section className="py-12">
      {/* Banner */}
      <div
        className="w-full py-6 mb-8"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <h2
          className="text-3xl font-black uppercase tracking-widest text-center"
          style={{ color: theme.buttonText }}
        >
          HOT DEALS
        </h2>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  );
}
