"use client";
import { useEffect, useState } from "react";
import {
  Settings, CreditCard, Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
  ImagePlus, Trash2, Lock, X, Wallet,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

interface EsewaForm {
  merchantCode: string;
  secretKey: string;
  isEnabled: boolean;
}

interface KhaltiForm {
  secretKey: string;
  isEnabled: boolean;
}

export default function SettingsPage() {
  const { themeColors: theme } = useStore();

  const [loading, setLoading] = useState(true);

  // eSewa state
  const [esewaForm, setEsewaForm] = useState<EsewaForm>({
    merchantCode: "",
    secretKey: "",
    isEnabled: false,
  });
  const [esewaSaving, setEsewaSaving] = useState(false);
  const [showEsewaSecret, setShowEsewaSecret] = useState(false);
  const [esewaMessage, setEsewaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Khalti state
  const [khaltiForm, setKhaltiForm] = useState<KhaltiForm>({
    secretKey: "",
    isEnabled: false,
  });
  const [khaltiSaving, setKhaltiSaving] = useState(false);
  const [showKhaltiSecret, setShowKhaltiSecret] = useState(false);
  const [khaltiMessage, setKhaltiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password confirmation modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [pendingSaveType, setPendingSaveType] = useState<"esewa" | "khalti" | null>(null);

  // Banner state
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/vendor/store");
      setBannerUrl(data.store?.branding?.storeBanner || null);

      const esewa = data.store?.payment?.esewa;
      if (esewa) {
        setEsewaForm({
          merchantCode: esewa.merchantCode || "",
          secretKey: "",
          isEnabled: esewa.isEnabled || false,
        });
      }

      const khalti = data.store?.payment?.khalti;
      if (khalti) {
        setKhaltiForm({
          secretKey: "",
          isEnabled: khalti.isEnabled || false,
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // ─── eSewa save ───
  const handleEsewaSaveClick = () => {
    if (!esewaForm.merchantCode.trim()) {
      setEsewaMessage({ type: "error", text: "Merchant code is required." });
      return;
    }
    setPendingSaveType("esewa");
    setConfirmPassword("");
    setPasswordError("");
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleEsewaConfirmSave = async (password: string) => {
    try {
      setEsewaSaving(true);
      setEsewaMessage(null);

      const payload: any = {
        merchantCode: esewaForm.merchantCode.trim(),
        isEnabled: esewaForm.isEnabled,
        password,
      };
      if (esewaForm.secretKey.trim()) {
        payload.secretKey = esewaForm.secretKey.trim();
      }

      const { data } = await api.patch("/vendor/payment-settings", payload);

      if (data.success) {
        setEsewaMessage({ type: "success", text: "eSewa settings saved successfully!" });
        setEsewaForm((f) => ({ ...f, secretKey: "" }));
        setShowPasswordModal(false);
        setConfirmPassword("");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to save settings.";
      if (err.response?.status === 401) {
        setPasswordError(errMsg);
        throw err; // let modal handler know
      } else {
        setEsewaMessage({ type: "error", text: errMsg });
        setShowPasswordModal(false);
      }
    } finally {
      setEsewaSaving(false);
    }
  };

  // ─── Khalti save ───
  const handleKhaltiSaveClick = () => {
    setPendingSaveType("khalti");
    setConfirmPassword("");
    setPasswordError("");
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleKhaltiConfirmSave = async (password: string) => {
    try {
      setKhaltiSaving(true);
      setKhaltiMessage(null);

      const payload: any = {
        isEnabled: khaltiForm.isEnabled,
        password,
      };
      if (khaltiForm.secretKey.trim()) {
        payload.secretKey = khaltiForm.secretKey.trim();
      }

      const { data } = await api.patch("/vendor/khalti-settings", payload);

      if (data.success) {
        setKhaltiMessage({ type: "success", text: "Khalti settings saved successfully!" });
        setKhaltiForm((f) => ({ ...f, secretKey: "" }));
        setShowPasswordModal(false);
        setConfirmPassword("");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to save settings.";
      if (err.response?.status === 401) {
        setPasswordError(errMsg);
        throw err;
      } else {
        setKhaltiMessage({ type: "error", text: errMsg });
        setShowPasswordModal(false);
      }
    } finally {
      setKhaltiSaving(false);
    }
  };

  // ─── Password modal confirm ───
  const handleConfirmSave = async () => {
    if (!confirmPassword.trim()) {
      setPasswordError("Please enter your password.");
      return;
    }
    try {
      if (pendingSaveType === "esewa") {
        await handleEsewaConfirmSave(confirmPassword);
      } else if (pendingSaveType === "khalti") {
        await handleKhaltiConfirmSave(confirmPassword);
      }
    } catch {
      // password error already set inside the handlers
    }
  };

  const isSaving = esewaSaving || khaltiSaving;

  // ─── Banner handlers ───
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setBannerMessage(null);
  };

  const handleBannerCancel = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) return;
    setBannerSaving(true);
    setBannerMessage(null);
    try {
      const formData = new FormData();
      formData.append("banner", bannerFile);
      const { data } = await api.patch("/vendor/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBannerUrl(data.storeBanner);
      handleBannerCancel();
      setBannerMessage({ type: "success", text: "Banner uploaded successfully!" });
    } catch (err: any) {
      setBannerMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload banner.",
      });
    } finally {
      setBannerSaving(false);
    }
  };

  const handleBannerRemove = async () => {
    setBannerSaving(true);
    setBannerMessage(null);
    try {
      await api.patch("/vendor/banner", { remove: "true" });
      setBannerUrl(null);
      setBannerMessage({ type: "success", text: "Banner removed successfully!" });
    } catch (err: any) {
      setBannerMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to remove banner.",
      });
    } finally {
      setBannerSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store settings</p>
      </div>

      {/* Store Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <ImagePlus size={16} style={{ color: theme.primaryColor }} />
          </div>
          <div>
            <h2 className="font-black text-gray-900">Store Banner</h2>
            <p className="text-xs text-gray-400">Upload a banner image for your storefront hero section</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin" style={{ color: theme.primaryColor }} />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {bannerMessage && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: bannerMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: bannerMessage.type === "success" ? "#059669" : "#ef4444",
                }}
              >
                {bannerMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {bannerMessage.text}
              </div>
            )}

            {bannerUrl && !bannerPreview && (
              <div className="space-y-3">
                <img
                  src={bannerUrl}
                  alt="Store banner"
                  className="w-full h-48 object-cover rounded-xl border border-gray-100"
                />
                <button
                  onClick={handleBannerRemove}
                  disabled={bannerSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  {bannerSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Remove Banner
                </button>
              </div>
            )}

            {bannerPreview && (
              <div className="space-y-3">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleBannerUpload}
                    disabled={bannerSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
                  >
                    {bannerSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                    {bannerSaving ? "Uploading..." : "Upload Banner"}
                  </button>
                  <button
                    onClick={handleBannerCancel}
                    disabled={bannerSaving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!bannerPreview && (
              <label
                className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-gray-300"
                style={{ borderColor: bannerUrl ? theme.borderColor : "#d1d5db" }}
              >
                <ImagePlus size={28} className="text-gray-300 mb-2" />
                <span className="text-sm font-semibold text-gray-400">
                  {bannerUrl ? "Click to replace banner" : "Click to upload a banner"}
                </span>
                <span className="text-xs text-gray-300 mt-1">JPG, PNG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Payment Settings Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: theme.secondaryColor }}
        >
          <CreditCard size={18} style={{ color: theme.primaryColor }} />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900">Payment Gateways</h2>
          <p className="text-xs text-gray-400">Configure your payment providers. Password required to save changes.</p>
        </div>
      </div>

      {/* Two-column Payment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* eSewa Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#60BB46]/10 flex items-center justify-center">
                <span className="text-[#60BB46] font-black text-xs">eSewa</span>
              </div>
              <div>
                <h3 className="font-black text-gray-900">eSewa</h3>
                <p className="text-xs text-gray-400">Digital wallet</p>
              </div>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: esewaForm.isEnabled ? "#ecfdf5" : "#f3f4f6",
                color: esewaForm.isEnabled ? "#059669" : "#9ca3af",
              }}
            >
              {esewaForm.isEnabled ? "Active" : "Inactive"}
            </span>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin" style={{ color: theme.primaryColor }} />
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {esewaMessage && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: esewaMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: esewaMessage.type === "success" ? "#059669" : "#ef4444",
                  }}
                >
                  {esewaMessage.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {esewaMessage.text}
                </div>
              )}

              {/* Merchant Code */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Merchant Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={esewaForm.merchantCode}
                  onChange={(e) => setEsewaForm((f) => ({ ...f, merchantCode: e.target.value }))}
                  placeholder="e.g. EPAYTEST"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: theme.textColor,
                    border: `2px solid transparent`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showEsewaSecret ? "text" : "password"}
                    value={esewaForm.secretKey}
                    onChange={(e) => setEsewaForm((f) => ({ ...f, secretKey: e.target.value }))}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium outline-none transition-all"
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
                    onClick={() => setShowEsewaSecret(!showEsewaSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showEsewaSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Enable toggle */}
              <div className="flex items-center justify-between py-1">
                <p className="text-sm font-bold text-gray-900">Enable eSewa</p>
                <button
                  onClick={() => setEsewaForm((f) => ({ ...f, isEnabled: !f.isEnabled }))}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: esewaForm.isEnabled ? "#60BB46" : "#d1d5db",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                    style={{
                      left: esewaForm.isEnabled ? "calc(100% - 1.375rem)" : "0.125rem",
                    }}
                  />
                </button>
              </div>

              {/* Save */}
              <button
                onClick={handleEsewaSaveClick}
                disabled={esewaSaving}
                className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
              >
                {esewaSaving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><Lock size={14} /> Save eSewa Settings</>
                )}
              </button>

              {/* Sandbox hint */}
              <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Sandbox:</strong> Merchant code <code className="bg-gray-200 px-1 rounded text-xs">EPAYTEST</code>,
                  Secret key <code className="bg-gray-200 px-1 rounded text-xs">8gBm/:&amp;EnhH.1&quot;</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Khalti Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C2D91]/10 flex items-center justify-center">
                <span className="text-[#5C2D91] font-black text-xs">Khalti</span>
              </div>
              <div>
                <h3 className="font-black text-gray-900">Khalti</h3>
                <p className="text-xs text-gray-400">Digital wallet</p>
              </div>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: khaltiForm.isEnabled ? "#ecfdf5" : "#f3f4f6",
                color: khaltiForm.isEnabled ? "#059669" : "#9ca3af",
              }}
            >
              {khaltiForm.isEnabled ? "Active" : "Inactive"}
            </span>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin" style={{ color: theme.primaryColor }} />
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {khaltiMessage && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: khaltiMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: khaltiMessage.type === "success" ? "#059669" : "#ef4444",
                  }}
                >
                  {khaltiMessage.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {khaltiMessage.text}
                </div>
              )}

              {/* Secret Key */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Secret Key (Live Secret Key) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showKhaltiSecret ? "text" : "password"}
                    value={khaltiForm.secretKey}
                    onChange={(e) => setKhaltiForm((f) => ({ ...f, secretKey: e.target.value }))}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium outline-none transition-all"
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
                    onClick={() => setShowKhaltiSecret(!showKhaltiSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKhaltiSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Get your key from the Khalti merchant dashboard
                </p>
              </div>

              {/* Enable toggle */}
              <div className="flex items-center justify-between py-1">
                <p className="text-sm font-bold text-gray-900">Enable Khalti</p>
                <button
                  onClick={() => setKhaltiForm((f) => ({ ...f, isEnabled: !f.isEnabled }))}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: khaltiForm.isEnabled ? "#5C2D91" : "#d1d5db",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                    style={{
                      left: khaltiForm.isEnabled ? "calc(100% - 1.375rem)" : "0.125rem",
                    }}
                  />
                </button>
              </div>

              {/* Save */}
              <button
                onClick={handleKhaltiSaveClick}
                disabled={khaltiSaving}
                className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
              >
                {khaltiSaving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><Lock size={14} /> Save Khalti Settings</>
                )}
              </button>

              {/* Sandbox hint */}
              <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Sandbox:</strong> Sign up at{" "}
                  <span className="font-semibold text-[#5C2D91]">test-admin.khalti.com</span> to get your test secret key.
                  Test with phone <code className="bg-gray-200 px-1 rounded text-xs">9800000001</code>,
                  MPIN <code className="bg-gray-200 px-1 rounded text-xs">1111</code>,
                  OTP <code className="bg-gray-200 px-1 rounded text-xs">987654</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div
        className="rounded-2xl p-5 flex gap-4"
        style={{ backgroundColor: theme.secondaryColor, border: `1px solid ${theme.borderColor}` }}
      >
        <Settings size={20} className="text-gray-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-700">Testing Payments</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Both eSewa and Khalti support sandbox testing. Enable one or both gateways — customers will
            choose their preferred payment method at checkout. You can enable both simultaneously.
          </p>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <Lock size={16} style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">Confirm Password</h3>
                  <p className="text-xs text-gray-400">
                    Required to update {pendingSaveType === "khalti" ? "Khalti" : "eSewa"} settings
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowPasswordModal(false); setConfirmPassword(""); setPasswordError(""); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Payment credentials are sensitive. Please enter your account password to confirm this change.
              </p>

              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold bg-red-50 text-red-500">
                  <AlertCircle size={16} />
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Your Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !isSaving) handleConfirmSave(); }}
                    placeholder="Enter your password"
                    autoFocus
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      backgroundColor: theme.secondaryColor,
                      color: theme.textColor,
                      border: `2px solid ${passwordError ? "#ef4444" : "transparent"}`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = passwordError ? "#ef4444" : theme.primaryColor)}
                    onBlur={(e) => (e.target.style.borderColor = passwordError ? "#ef4444" : "transparent")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setShowPasswordModal(false); setConfirmPassword(""); setPasswordError(""); }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSaving || !confirmPassword.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
              >
                {isSaving ? (
                  <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                ) : (
                  "Confirm & Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
