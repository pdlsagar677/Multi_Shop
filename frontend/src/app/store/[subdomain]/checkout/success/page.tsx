"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag, Loader2, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";
import { useCartStore } from "@/store/cartStore";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { store, themeColors: theme, loading: storeLoading } = useStore();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      setVerifying(false);
      setErrorMsg("No payment data received.");
      return;
    }

    verifyPayment(data);
  }, [searchParams]);

  const verifyPayment = async (data: string) => {
    try {
      const { data: res } = await api.get(`/orders/payment/verify?data=${encodeURIComponent(data)}`);

      if (res.success) {
        setVerified(true);
        setOrderNumber(res.order?.orderNumber || "");

        // Clear vendor's items from cart
        if (store) {
          const vendorItems = items.filter((i) => i.vendorSubdomain === store.subdomain);
          vendorItems.forEach((i) => removeItem(i._id));
        }
      } else {
        setErrorMsg(res.message || "Payment verification failed.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Payment verification failed. Please contact support."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: theme.primaryColor }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-2xl p-8 sm:p-10 text-center"
          style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
        >
          {verifying ? (
            <>
              <Loader2
                size={56}
                className="animate-spin mx-auto mb-6"
                style={{ color: theme.primaryColor }}
              />
              <h1 className="text-xl font-black mb-2" style={{ color: theme.textColor }}>
                Verifying Payment
              </h1>
              <p className="text-gray-500 text-sm">
                Please wait while we confirm your payment with eSewa...
              </p>
            </>
          ) : verified ? (
            <>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-black mb-2" style={{ color: theme.textColor }}>
                Order Confirmed!
              </h1>
              <p className="text-gray-500 text-sm mb-2">
                Your payment was successful. Thank you for your purchase!
              </p>
              {orderNumber && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold mb-8"
                  style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor }}
                >
                  <Package size={16} />
                  Order #{orderNumber}
                </div>
              )}

              <div className="space-y-3">
                <Link
                  href="/account"
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  <ShoppingBag size={16} /> View My Orders
                </Link>
                <Link
                  href="/"
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all hover:opacity-80"
                  style={{ borderColor: theme.borderColor, color: theme.textColor }}
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <XCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-black mb-2" style={{ color: theme.textColor }}>
                Verification Failed
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                {errorMsg}
              </p>
              <div className="space-y-3">
                <Link
                  href="/account"
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  Check My Orders
                </Link>
                <Link
                  href="/"
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all hover:opacity-80"
                  style={{ borderColor: theme.borderColor, color: theme.textColor }}
                >
                  Back to Store
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
