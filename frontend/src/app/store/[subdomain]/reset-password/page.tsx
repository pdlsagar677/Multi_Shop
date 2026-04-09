"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Check, AlertCircle, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { store, themeColors: theme } = useStore();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const checks = [
    { label: "At least 8 characters", pass: form.newPassword.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(form.newPassword) },
    { label: "One number", pass: /[0-9]/.test(form.newPassword) },
    { label: "Passwords match", pass: form.newPassword === form.confirmPassword && form.confirmPassword !== "" },
  ];
  const isValid = checks.every((c) => c.pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword: form.newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bgColor }}>
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2" style={{ color: theme.textColor }}>Invalid Reset Link</h2>
          <p className="text-gray-500 text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: theme.primaryColor }}>
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bgColor }}>
        <div className="text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#ecfdf5" }}>
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black mb-3" style={{ color: theme.textColor }}>Password Reset!</h2>
          <p className="text-gray-500 text-sm mb-8">Your password has been updated successfully. You can now log in.</p>
          <button
            onClick={() => router.push("/login?passwordChanged=true")}
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90"
            style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bgColor }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
            style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
          >
            {store?.storeName?.[0]?.toUpperCase() || "S"}
          </div>
          <span className="text-xl font-black" style={{ color: theme.textColor }}>
            {store?.storeName || "Store"}
          </span>
        </div>

        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <Lock size={26} style={{ color: theme.primaryColor }} />
          </div>
          <h2 className="text-3xl font-black mb-2" style={{ color: theme.textColor }}>Set new password</h2>
          <p className="text-gray-500 text-sm">Enter your new password below.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.newPassword}
                onChange={(e) => { setForm((p) => ({ ...p, newPassword: e.target.value })); setError(null); }}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => { setForm((p) => ({ ...p, confirmPassword: e.target.value })); setError(null); }}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {form.newPassword && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${c.pass ? "bg-green-500" : "bg-gray-200"}`}>
                    {c.pass && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${c.pass ? "text-green-600" : "text-gray-400"}`}>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: isValid && !isSubmitting ? theme.buttonBg : "#f3f4f6", color: isValid && !isSubmitting ? theme.buttonText : "#9ca3af" }}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: theme.primaryColor }}
          >
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
