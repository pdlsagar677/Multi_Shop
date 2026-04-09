"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

export default function ForgotPasswordPage() {
  const { store, themeColors: theme } = useStore();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {sent ? (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black mb-3" style={{ color: theme.textColor }}>
              Check your email
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              If an account exists for <strong>{email}</strong>, we sent a password reset link.
              Check your inbox (and spam folder).
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              style={{ color: theme.primaryColor }}
            >
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <Mail size={26} style={{ color: theme.primaryColor }} />
              </div>
              <h2 className="text-3xl font-black mb-2" style={{ color: theme.textColor }}>
                Forgot password?
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                    onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  "Send Reset Link"
                )}
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
          </>
        )}
      </div>
    </div>
  );
}
