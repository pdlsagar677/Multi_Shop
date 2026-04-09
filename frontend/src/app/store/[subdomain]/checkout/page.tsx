"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ShieldCheck, Loader2, MapPin,
  CreditCard, Package, ImageIcon, Wallet,
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
  const fetchCart = useCartStore((s) => s.fetchCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const [form, setForm] = useState<ShippingForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "khalti">("esewa");

  // Saved addresses
  interface SavedAddress {
    _id: string;
    street: string;
    city: string;
    state: string | null;
    zipCode: string | null;
    country: string;
    phone: string;
    label: string;
    isDefault: boolean;
  }
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Check which payment methods the vendor has enabled
  const esewaEnabled = store?.payment?.esewa?.isEnabled || false;
  const khaltiEnabled = store?.payment?.khalti?.isEnabled || false;

  // Auto-select the first available payment method
  useEffect(() => {
    if (esewaEnabled) setPaymentMethod("esewa");
    else if (khaltiEnabled) setPaymentMethod("khalti");
  }, [esewaEnabled, khaltiEnabled]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch cart and addresses
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      api.get("/addresses").then(({ data }) => {
        const addrs = data.addresses || [];
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a: SavedAddress) => a.isDefault) || addrs[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else {
          setUseNewAddress(true);
        }
      }).catch((err) => {
        console.error("Failed to fetch addresses:", err.response?.data?.message || err.message);
      });
    }
  }, [isAuthenticated, fetchCart]);

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || "").split(" ");
      setForm((f) => ({
        ...f,
        firstName: f.firstName || first || "",
        lastName: f.lastName || rest.join(" ") || "",
        email: f.email || user.email || "",
        phone: f.phone || user.phone || "",
      }));
    }
  }, [user]);

  // When a saved address is selected, pre-fill phone from that address
  useEffect(() => {
    if (selectedAddressId && !useNewAddress) {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (addr) {
        setForm((f) => ({
          ...f,
          phone: f.phone || addr.phone || "",
          street: addr.street,
          city: addr.city,
          state: addr.state || "",
          zipCode: addr.zipCode || "",
        }));
      }
    }
  }, [selectedAddressId, useNewAddress, savedAddresses]);

  const storeItems = items;
  const subtotal = getSubtotal();

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
    // Only validate form fields if using new address
    if (useNewAddress && !validate()) return;
    if (!useNewAddress && !selectedAddressId) {
      setApiError("Please select a shipping address.");
      return;
    }
    // Always validate customer info
    const custErrors: Partial<ShippingForm> = {};
    if (!form.firstName.trim()) custErrors.firstName = "Required";
    if (!form.lastName.trim()) custErrors.lastName = "Required";
    if (!form.email.trim()) custErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) custErrors.email = "Invalid email";
    if (!form.phone.trim()) custErrors.phone = "Required";
    if (Object.keys(custErrors).length > 0) {
      setErrors(custErrors);
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      const orderPayload: any = {
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        },
        items: storeItems.map((i) => ({
          productId: i.productId._id,
          name: i.productId.name,
          quantity: i.quantity,
        })),
        paymentMethod,
      };

      if (useNewAddress) {
        orderPayload.shippingAddress = {
          street: form.street,
          city: form.city,
          state: form.state || null,
          zipCode: form.zipCode || null,
        };
      } else {
        orderPayload.addressId = selectedAddressId;
      }

      // 1. Create order
      const { data: orderData } = await api.post("/orders", orderPayload);

      if (!orderData.success) {
        setApiError(orderData.message || "Failed to create order.");
        setSubmitting(false);
        return;
      }

      const orderId = orderData.order._id;

      // 2. Initiate payment
      const { data: payData } = await api.post(`/orders/${orderId}/pay`);

      if (!payData.success) {
        setApiError(payData.message || "Failed to initiate payment.");
        setSubmitting(false);
        return;
      }

      // 3. Handle redirect based on payment method
      if (payData.paymentMethod === "khalti") {
        // Khalti: redirect to payment URL
        window.location.href = payData.paymentUrl;
      } else {
        // eSewa: create hidden form and submit
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
      }
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

  const noPaymentEnabled = !esewaEnabled && !khaltiEnabled;

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
          {/* Left: Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
            >
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

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} theme={theme} required />
                  <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} theme={theme} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} theme={theme} required />
                  <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} theme={theme} required />
                </div>

                {savedAddresses.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Shipping Address
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => { setSelectedAddressId(addr._id); setUseNewAddress(false); }}
                          className="text-left p-4 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: !useNewAddress && selectedAddressId === addr._id ? theme.primaryColor : theme.borderColor,
                            backgroundColor: !useNewAddress && selectedAddressId === addr._id ? theme.secondaryColor : theme.cardBg,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}>
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-xs font-semibold text-green-600">Default</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold" style={{ color: theme.textColor }}>{addr.street}</p>
                          <p className="text-xs text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zipCode || ""}</p>
                          <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUseNewAddress(true); setSelectedAddressId(null); }}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: useNewAddress ? theme.primaryColor : theme.accentColor }}
                    >
                      + Use a new address
                    </button>
                  </div>
                )}

                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Address</p>
                    )}
                    <InputField label="Street Address" name="street" value={form.street} onChange={handleChange} error={errors.street} theme={theme} required />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InputField label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} theme={theme} required />
                      <InputField label="State / Province" name="state" value={form.state} onChange={handleChange} theme={theme} />
                      <InputField label="Zip Code" name="zipCode" value={form.zipCode} onChange={handleChange} theme={theme} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            {!noPaymentEnabled && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
              >
                <div
                  className="px-6 py-4 flex items-center gap-3 border-b"
                  style={{ borderColor: theme.borderColor }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: theme.secondaryColor }}
                  >
                    <Wallet size={16} style={{ color: theme.primaryColor }} />
                  </div>
                  <h2 className="font-black" style={{ color: theme.textColor }}>
                    Payment Method
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {esewaEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("esewa")}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                        style={{
                          borderColor: paymentMethod === "esewa" ? theme.primaryColor : theme.borderColor,
                          backgroundColor: paymentMethod === "esewa" ? theme.secondaryColor : theme.cardBg,
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#60BB46]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#60BB46] font-black text-sm">eSewa</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: theme.textColor }}>eSewa</p>
                          <p className="text-xs text-gray-400">Pay with your eSewa wallet</p>
                        </div>
                        <div className="ml-auto">
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: paymentMethod === "esewa" ? theme.primaryColor : "#d1d5db" }}
                          >
                            {paymentMethod === "esewa" && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                            )}
                          </div>
                        </div>
                      </button>
                    )}

                    {khaltiEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("khalti")}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                        style={{
                          borderColor: paymentMethod === "khalti" ? theme.primaryColor : theme.borderColor,
                          backgroundColor: paymentMethod === "khalti" ? theme.secondaryColor : theme.cardBg,
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#5C2D91]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#5C2D91] font-black text-sm">Khalti</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: theme.textColor }}>Khalti</p>
                          <p className="text-xs text-gray-400">Pay with your Khalti wallet</p>
                        </div>
                        <div className="ml-auto">
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: paymentMethod === "khalti" ? theme.primaryColor : "#d1d5db" }}
                          >
                            {paymentMethod === "khalti" && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Review + Pay */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 sticky top-6"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
            >
              <h2 className="text-lg font-black mb-5" style={{ color: theme.textColor }}>
                Order Review
              </h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {storeItems.map((item) => {
                  const product = item.productId;
                  if (!product) return null;
                  const price = product.effectivePrice ?? product.price;
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                        style={{ backgroundColor: theme.secondaryColor }}
                      >
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={16} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: theme.textColor }}>
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} x Rs.{price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color: theme.textColor }}>
                        Rs.{(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

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

              {noPaymentEnabled ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold text-center">
                  No payment method is configured for this store yet.
                </div>
              ) : (
                <>
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
                        <CreditCard size={16} />
                        Pay with {paymentMethod === "khalti" ? "Khalti" : "eSewa"}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <ShieldCheck size={14} />
                    Secure payment via {paymentMethod === "khalti" ? "Khalti" : "eSewa"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

/* Reusable Input Field */

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
