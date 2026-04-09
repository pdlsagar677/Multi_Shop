"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Minus, Plus, Trash2, ChevronLeft,
  Package, ArrowRight, ShieldCheck, ImageIcon, Loader2,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, CartItem } from "@/store/cartStore";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";

export default function CartPage() {
  const router = useRouter();
  const { store, themeColors: theme, loading: storeLoading } = useStore();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const loading = useCartStore((s) => s.loading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const hasOutOfStockItems = useCartStore((s) => s.hasOutOfStockItems);

  const [confirmClear, setConfirmClear] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch cart from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const storeItems = items;

  const subtotal = getSubtotal();
  const totalSaved = storeItems.reduce((s, i) => {
    const product = i.productId;
    if (!product) return s;
    const effectivePrice = product.effectivePrice ?? product.price;
    if (effectivePrice < product.price) {
      return s + (product.price - effectivePrice) * i.quantity;
    }
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return s + (product.compareAtPrice - product.price) * i.quantity;
    }
    return s;
  }, 0);

  const hasOOS = hasOutOfStockItems();

  if (storeLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: theme.primaryColor }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: theme.textColor }}>
              Shopping Cart
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {storeItems.length === 0
                ? "Your cart is empty"
                : `${storeItems.length} ${storeItems.length === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: theme.primaryColor }}
          >
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {loading && storeItems.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: theme.primaryColor }} />
          </div>
        ) : storeItems.length === 0 ? (
          /* Empty cart */
          <div
            className="rounded-2xl p-16 text-center"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
          >
            <ShoppingCart size={64} className="text-gray-200 mx-auto mb-6" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Looks like you haven&apos;t added any products yet. Start exploring our collection!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              <Package size={18} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {storeItems.map((item) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  theme={theme}
                  onUpdateQty={(qty) => {
                    if (item.productId) updateQuantity(item.productId._id, qty);
                  }}
                  onRemove={() => {
                    if (item.productId) removeItem(item.productId._id);
                  }}
                />
              ))}

              {/* Clear cart */}
              <div className="flex justify-end pt-2">
                {confirmClear ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Clear all items?</span>
                    <button
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="text-sm font-bold text-red-500 hover:text-red-600"
                    >
                      Yes, clear
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="text-sm font-bold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Clear Cart
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="rounded-2xl p-6 sticky top-6"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
              >
                <h2 className="text-lg font-black mb-5" style={{ color: theme.textColor }}>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({storeItems.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="font-semibold" style={{ color: theme.textColor }}>
                      Rs.{subtotal.toFixed(2)}
                    </span>
                  </div>
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">You save</span>
                      <span className="font-semibold text-green-600">
                        -Rs.{totalSaved.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-500 text-xs">Calculated at checkout</span>
                  </div>
                </div>

                <div
                  className="border-t pt-4 mb-6 flex justify-between items-baseline"
                  style={{ borderColor: theme.borderColor }}
                >
                  <span className="font-bold" style={{ color: theme.textColor }}>
                    Total
                  </span>
                  <span className="text-2xl font-black" style={{ color: theme.textColor }}>
                    Rs.{subtotal.toFixed(2)}
                  </span>
                </div>

                {hasOOS && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-50 text-red-600">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-semibold">Remove out-of-stock items to proceed</span>
                  </div>
                )}

                {hasOOS ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
                    style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </Link>
                )}

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <ShieldCheck size={14} />
                  Secure checkout powered by eSewa
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

/* Cart Item Row */

interface CartItemRowProps {
  item: CartItem;
  theme: any;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}

function CartItemRow({ item, theme, onUpdateQty, onRemove }: CartItemRowProps) {
  const product = item.productId;
  if (!product) return null;

  const effectivePrice = product.effectivePrice ?? product.price;
  const hasDiscount = effectivePrice < product.price || (product.compareAtPrice && product.compareAtPrice > product.price);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5 transition-all relative ${isOutOfStock ? "opacity-60" : ""}`}
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${isOutOfStock ? "#fca5a5" : theme.borderColor}` }}
    >
      {/* Image */}
      <Link
        href={`/product/${product._id}`}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 relative"
        style={{ backgroundColor: theme.secondaryColor }}
      >
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-gray-300" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link
          href={`/product/${product._id}`}
          className="font-bold text-sm sm:text-base hover:underline line-clamp-2"
          style={{ color: theme.textColor }}
        >
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-black text-base" style={{ color: theme.textColor }}>
            Rs.{effectivePrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              Rs.{(product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock badges */}
        <div className="mt-1">
          {isOutOfStock && (
            <span className="text-xs font-bold text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} /> Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="text-xs font-semibold text-amber-500">
              Only {product.stock} left
            </span>
          )}
          {!isOutOfStock && !isLowStock && (
            <span className="text-xs text-green-500 font-medium">In Stock</span>
          )}
        </div>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div
            className="flex items-center border-2 rounded-lg overflow-hidden"
            style={{ borderColor: theme.borderColor }}
          >
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              disabled={isOutOfStock}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
            >
              <Minus size={14} />
            </button>
            <span
              className="w-10 h-9 flex items-center justify-center text-sm font-bold border-x-2"
              style={{ borderColor: theme.borderColor, color: theme.textColor }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              disabled={item.quantity >= product.stock || isOutOfStock}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-black hidden sm:block" style={{ color: theme.textColor }}>
              Rs.{(effectivePrice * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={onRemove}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
