"use client";
import Link from "next/link";
import { ShoppingCart, ImageIcon, Star } from "lucide-react";

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
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.borderColor}`,
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {/* Discount badge */}
          {hasDiscount && discountPercent > 0 && (
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm"
              style={{
                backgroundColor: theme.primaryColor,
                color: theme.buttonText,
              }}
            >
              -{discountPercent}%
            </span>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
            <span className="px-2 py-1 rounded-lg text-xs font-bold shadow-sm bg-yellow-400 text-yellow-900 flex items-center gap-1">
              <Star size={10} className="fill-yellow-900" /> Featured
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low stock indicator */}
        {product.stock > 0 && product.stock < 10 && (
          <span className="absolute bottom-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700">
            Only {product.stock} left
          </span>
        )}

        {/* Quick action on hover */}
        {product.stock > 0 && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: theme.buttonBg,
                color: theme.buttonText,
              }}
            >
              <ShoppingCart size={18} />
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: theme.accentColor }}
          >
            {product.category}
          </span>
        )}

        <h3
          className="font-bold text-sm mt-1 line-clamp-2 leading-snug"
          style={{ color: theme.textColor }}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-2.5">
          <span className="text-lg font-black" style={{ color: theme.textColor }}>
            Rs.{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && displayPrice < originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              Rs.{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
