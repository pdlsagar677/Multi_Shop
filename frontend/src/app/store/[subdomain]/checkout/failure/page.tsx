"use client";
import Link from "next/link";
import { XCircle, ShoppingCart, RotateCcw } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";

export default function CheckoutFailurePage() {
  const { themeColors: theme } = useStore();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-2xl p-8 sm:p-10 text-center"
          style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#fef2f2" }}
          >
            <XCircle size={40} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-black mb-2" style={{ color: theme.textColor }}>
            Payment Failed
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Your payment could not be processed. No charges were made. You can try again or return to your cart.
          </p>

          <div className="space-y-3">
            <Link
              href="/checkout"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              <RotateCcw size={16} /> Try Again
            </Link>
            <Link
              href="/cart"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all hover:opacity-80"
              style={{ borderColor: theme.borderColor, color: theme.textColor }}
            >
              <ShoppingCart size={16} /> Back to Cart
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
