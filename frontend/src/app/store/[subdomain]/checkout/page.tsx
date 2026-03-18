"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ShieldCheck, Loader2, MapPin,
  CreditCard, Package, ImageIcon,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";
import { useCartStore } from "@/store/cartStore";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const INITIAL_FORM: ShippingForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { store, themeColors: theme, loading: storeLoading } = useStore();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const items = useCartStore((s) => s.items);

  const [form, setForm] = useState<ShippingForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || "").split(" ");
      setForm((f) => ({
        ...f,
        firstName: first || "",
        lastName: rest.join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const storeItems = store
    ? items.filter((i) => i.vendorSubdomain === store.subdomain)
    : [];

  const subtotal = storeItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // Redirect if cart is empty
  useEffect(() => {
    if (!storeLoading && store && storeItems.length === 0) {
      router.replace("/cart");
    }
  }, [storeLoading, store, storeItems.length, router]);

  const validate = (): boolean => {
    const e: Partial<ShippingForm> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof ShippingForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");

    try {
      // 1. Create order
      const { data: orderData } = await api.post("/orders", {
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        },
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state || null,
          zipCode: form.zipCode || null,
        },
        items: storeItems.map((i) => ({
          productId: i._id,
          name: i.name,
          quantity: i.quantity,
        })),
      });

      if (!orderData.success) {
        setApiError(orderData.message || "Failed to create order.");
        setSubmitting(false);
        return;
      }

      const orderId = orderData.order._id;

      // 2. Initiate eSewa payment
      const { data: payData } = await api.post(`/orders/${orderId}/pay`);

      if (!payData.success) {
        setApiError(payData.message || "Failed to initiate payment.");
        setSubmitting(false);
        return;
      }

      // 3. Create hidden form and submit to eSewa
      const esewaForm = document.createElement("form");
      esewaForm.method = "POST";
      esewaForm.action = payData.esewaUrl;

      Object.entries(payData.formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        esewaForm.appendChild(input);
      });

      document.body.appendChild(esewaForm);
      esewaForm.submit();
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  };

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

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: theme.textColor }}>
              Checkout
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Complete your order details below
            </p>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: theme.primaryColor }}
          >
            <ChevronLeft size={16} /> Back to Cart
          </Link>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Shipping Form ── */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
            >
              {/* Section header */}
              <div
                className="px-6 py-4 flex items-center gap-3 border-b"
                style={{ borderColor: theme.borderColor }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <MapPin size={16} style={{ color: theme.primaryColor }} />
                </div>
                <h2 className="font-black" style={{ color: theme.textColor }}>
                  Shipping Information
                </h2>
              </div>

              <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="p-6 space-y-5">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    theme={theme}
                    required
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    theme={theme}
                    required
                  />
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    theme={theme}
                    required
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    theme={theme}
                    required
                  />
                </div>

                {/* Address */}
                <InputField
                  label="Street Address"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  error={errors.street}
                  theme={theme}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    error={errors.city}
                    theme={theme}
                    required
                  />
                  <InputField
                    label="State / Province"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    theme={theme}
                  />
                  <InputField
                    label="Zip Code"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    theme={theme}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* ── Right: Order Review + Pay ── */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 sticky top-6"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
            >
              <h2 className="text-lg font-black mb-5" style={{ color: theme.textColor }}>
                Order Review
              </h2>

              {/* Item list */}
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {storeItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                      style={{ backgroundColor: theme.secondaryColor }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: theme.textColor }}>
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity} x Rs.{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: theme.textColor }}>
                      Rs.{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div
                className="border-t pt-4 space-y-2 mb-5"
                style={{ borderColor: theme.borderColor }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold" style={{ color: theme.textColor }}>
                    Rs.{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-500 text-xs">Free</span>
                </div>
              </div>

              <div
                className="border-t pt-4 mb-6 flex justify-between items-baseline"
                style={{ borderColor: theme.borderColor }}
              >
                <span className="font-bold" style={{ color: theme.textColor }}>Total</span>
                <span className="text-2xl font-black" style={{ color: theme.textColor }}>
                  Rs.{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Pay button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
                style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Pay with eSewa
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                <ShieldCheck size={14} />
                Secure payment via eSewa
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

/* ─── Reusable Input Field ─── */

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  theme,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  theme: any;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
        style={{
          backgroundColor: theme.secondaryColor,
          color: theme.textColor,
          border: error ? "2px solid #ef4444" : `2px solid transparent`,
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = theme.primaryColor;
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = "transparent";
        }}
      />
      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}
