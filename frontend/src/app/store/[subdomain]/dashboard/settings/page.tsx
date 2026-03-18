"use client";
import { useEffect, useState } from "react";
import {
  Settings, CreditCard, Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

interface PaymentForm {
  merchantCode: string;
  secretKey: string;
  isEnabled: boolean;
}

export default function SettingsPage() {
  const { themeColors: theme } = useStore();

  const [form, setForm] = useState<PaymentForm>({
    merchantCode: "",
    secretKey: "",
    isEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/vendor/store");
      const esewa = data.store?.payment?.esewa;
      if (esewa) {
        setForm({
          merchantCode: esewa.merchantCode || "",
          secretKey: "", // secret is not returned by default (select: false)
          isEnabled: esewa.isEnabled || false,
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.merchantCode.trim()) {
      setMessage({ type: "error", text: "Merchant code is required." });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload: any = {
        merchantCode: form.merchantCode.trim(),
        isEnabled: form.isEnabled,
      };
      // Only send secretKey if user entered a new one
      if (form.secretKey.trim()) {
        payload.secretKey = form.secretKey.trim();
      }

      const { data } = await api.patch("/vendor/payment-settings", payload);

      if (data.success) {
        setMessage({ type: "success", text: "Payment settings saved successfully!" });
        setForm((f) => ({ ...f, secretKey: "" }));
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store settings</p>
      </div>

      {/* eSewa Payment Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <CreditCard size={16} style={{ color: theme.primaryColor }} />
          </div>
          <div>
            <h2 className="font-black text-gray-900">eSewa Payment</h2>
            <p className="text-xs text-gray-400">Configure your eSewa merchant account</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin" style={{ color: theme.primaryColor }} />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {message && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: message.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: message.type === "success" ? "#059669" : "#ef4444",
                }}
              >
                {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            {/* Merchant Code */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Merchant Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.merchantCode}
                onChange={(e) => setForm((f) => ({ ...f, merchantCode: e.target.value }))}
                placeholder="e.g. EPAYTEST"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  backgroundColor: theme.secondaryColor,
                  color: theme.textColor,
                  border: `2px solid transparent`,
                }}
                onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
              <p className="text-xs text-gray-400 mt-1">
                Use EPAYTEST for sandbox testing
              </p>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={form.secretKey}
                  onChange={(e) => setForm((f) => ({ ...f, secretKey: e.target.value }))}
                  placeholder="Enter new secret key (leave blank to keep current)"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: theme.textColor,
                    border: `2px solid transparent`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use 8gBm/:&amp;EnhH.1" for eSewa sandbox
              </p>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-gray-900">Enable eSewa Payments</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Allow customers to pay with eSewa
                </p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, isEnabled: !f.isEnabled }))}
                className="relative w-12 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: form.isEnabled ? theme.primaryColor : "#d1d5db",
                }}
              >
                <span
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
                  style={{
                    left: form.isEnabled ? "calc(100% - 1.625rem)" : "0.125rem",
                  }}
                />
              </button>
            </div>

            {/* Save */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      <div
        className="rounded-2xl p-5 flex gap-4"
        style={{ backgroundColor: theme.secondaryColor, border: `1px solid ${theme.borderColor}` }}
      >
        <Settings size={20} className="text-gray-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-700">Testing with eSewa Sandbox</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            For testing, use merchant code <strong>EPAYTEST</strong> and
            secret key <strong>8gBm/:&amp;EnhH.1&quot;</strong>. Use eSewa test
            credentials (9806800001 / Nepal@123) to complete test payments.
          </p>
        </div>
      </div>
    </div>
  );
}
