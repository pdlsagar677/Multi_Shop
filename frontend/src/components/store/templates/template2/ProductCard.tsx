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
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.borderColor}`,
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
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

        {/* Featured badge — top right */}
        {product.isFeatured && (
          <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center shadow-md">
            <Star size={14} className="fill-yellow-900" />
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {product.stock > 0 && product.stock < 10 && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
            Only {product.stock} left
          </span>
        )}

        {/* Quick cart action on hover */}
        {product.stock > 0 && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
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
        {/* Category pill */}
        {product.category && (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{
              backgroundColor: theme.secondaryColor,
              color: theme.accentColor,
            }}
          >
            {product.category}
          </span>
        )}

        <h3
          className="font-bold text-sm line-clamp-2 leading-snug"
          style={{ color: theme.textColor }}
        >
          {product.name}
        </h3>

        {/* Price + discount inline */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-black" style={{ color: theme.textColor }}>
            Rs.{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && displayPrice < originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              Rs.{originalPrice.toFixed(2)}
            </span>
          )}
          {hasDiscount && discountPercent > 0 && (
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold"
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
