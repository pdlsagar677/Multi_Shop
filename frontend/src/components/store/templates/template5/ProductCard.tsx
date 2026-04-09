"use client";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

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

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonBg: string;
  buttonText: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
}

interface ProductCardProps {
  product: Product;
  theme: Theme;
}

export default function ProductCard({ product, theme }: ProductCardProps) {
  const hasPercentDiscount = product.discountPercent && product.discountPercent > 0;
  const hasCompareDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const hasDiscount = hasPercentDiscount || hasCompareDiscount;

  const displayPrice = product.effectivePrice ?? product.price;
  const originalPrice = hasPercentDiscount
    ? product.price
    : hasCompareDiscount
    ? product.compareAtPrice!
    : product.price;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group block transition-all duration-300 hover:shadow-md"
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} className="text-gray-200" />
          </div>
        )}

        {/* Out of stock */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-gray-500 font-light">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-sm tracking-wide uppercase line-clamp-1"
          style={{ color: theme.textColor }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xs" style={{ color: "rgb(107, 114, 128)" }}>
            Rs.{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && displayPrice < originalPrice && (
            <span className="text-xs text-gray-300 line-through">
              Rs.{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
