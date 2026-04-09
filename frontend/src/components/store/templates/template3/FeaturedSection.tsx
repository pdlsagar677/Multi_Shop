"use client";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Clock, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import Image from "next/image";
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

interface FeaturedSectionProps {
  subdomain: string;
  theme: any;
}

export default function FeaturedSection({
  subdomain,
  theme,
}: FeaturedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/store/${subdomain}/products?featured=true&limit=6`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading || products.length === 0) return null;

  // Split products for layout
  const mainProduct = products[0];
  const secondaryProducts = products.slice(1, 3);
  const remainingProducts = products.slice(3, 6);

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 mb-3">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-600">Handpicked Just For You</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: theme.textColor }}>
            Featured Collection
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Discover our most loved products, curated with care
          </p>
        </div>

        {/* Main Featured Product - Hero Style */}
        {mainProduct && (
          <div className="mb-8 group">
            <div 
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.primaryColor}05)`,
                border: `1px solid ${theme.primaryColor}20`
              }}
            >
              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                {/* Image Side */}
                <div className="relative aspect-square md:aspect-auto md:h-[300px] rounded-xl overflow-hidden bg-gray-100">
                  {mainProduct.images?.[0] && (
                    <img
                      src={mainProduct.images[0]}
                      alt={mainProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {mainProduct.discountPercent && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold bg-red-500 text-white">
                      -{mainProduct.discountPercent}%
                    </div>
                  )}
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-xs font-medium text-green-600">Best Seller</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: theme.textColor }}>
                    {mainProduct.name}
                  </h3>
                  {mainProduct.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {mainProduct.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                      ${mainProduct.effectivePrice?.toFixed(2) || mainProduct.price.toFixed(2)}
                    </span>
                    {mainProduct.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${mainProduct.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/product/${mainProduct._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all w-fit hover:gap-3"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.buttonText,
                    }}
                  >
                    Shop Now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Products - 2 Column Grid */}
        {secondaryProducts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {secondaryProducts.map((product) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
                style={{ border: `1px solid ${theme.borderColor}20` }}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="flex gap-4 p-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: theme.textColor }}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                        ${product.effectivePrice?.toFixed(2) || product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {hoveredProduct === product._id && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Remaining Products - 3 Column Grid */}
        {remainingProducts.length > 0 && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">More to Love</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {remainingProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                    {product.discountPercent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold bg-red-500 text-white">
                        -{product.discountPercent}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: theme.textColor }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                          ${product.effectivePrice?.toFixed(2) || product.price.toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}