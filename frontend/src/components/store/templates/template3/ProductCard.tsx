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
  const hasPercentDiscount =
    product.discountPercent && product.discountPercent > 0;
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

  // Format price without decimals if it's a whole number
  const formatPrice = (price: number) => {
    if (Number.isInteger(price)) {
      return price.toString();
    }
    return price.toFixed(2);
  };

  return (
    <Link
      href={`/product/${product._id}`}
      className="group flex flex-row gap-3 sm:gap-4 rounded-xl p-3 transition-colors duration-200"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.borderColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.primaryColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.borderColor;
      }}
    >
      {/* Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-50 shrink-0">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-gray-200" />
          </div>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded text-[9px] font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {product.category && (
          <span
            className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: theme.accentColor }}
          >
            {product.category}
          </span>
        )}

        <h3
          className="font-bold text-xs sm:text-sm md:text-base mt-0.5 leading-tight line-clamp-2"
          style={{ color: theme.textColor }}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
          <span
            className="text-sm sm:text-base md:text-lg font-bold"
            style={{ color: theme.textColor }}
          >
            Rs. {formatPrice(displayPrice)}
          </span>
          
          {hasDiscount && displayPrice < originalPrice && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
              Rs. {formatPrice(originalPrice)}
            </span>
          )}
          
          {hasDiscount && discountPercent > 0 && (
            <span
              className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap"
              style={{
                backgroundColor: theme.primaryColor,
                color: theme.buttonText,
              }}
            >
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}