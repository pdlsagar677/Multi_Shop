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

  const discountPercent = hasPercentDiscount
    ? product.discountPercent!
    : hasCompareDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group block relative overflow-hidden rounded-xl transition-all duration-300"
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-200" />
          </div>
        )}

        {/* Discount badge top-left */}
        {hasDiscount && discountPercent > 0 && (
          <span
            className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md"
            style={{
              backgroundColor: theme.primaryColor,
              color: theme.buttonText,
            }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Dark hover overlay */}
        {product.stock > 0 && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-white font-bold text-center text-sm line-clamp-2">
              {product.name}
            </span>
            <span className="text-white text-lg font-black">
              Rs.{displayPrice.toFixed(2)}
            </span>
            <span
              className="text-xs uppercase tracking-wider font-bold"
              style={{ color: theme.primaryColor }}
            >
              Shop Now
            </span>
          </div>
        )}
      </div>

      {/* Info below image */}
      <div className="p-3">
        <h3
          className="font-bold text-sm line-clamp-1"
          style={{ color: theme.textColor }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-black" style={{ color: theme.textColor }}>
            Rs.{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && displayPrice < originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              Rs.{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
