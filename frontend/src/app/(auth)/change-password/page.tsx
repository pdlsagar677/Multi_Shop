"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Check, AlertCircle, ShoppingBag } from "lucide-react";
import api from "@/lib/axios";

function ChangePasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const userId       = searchParams.get("userId");

  const [form, setForm]             = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const checks = [
    { label: "At least 8 characters",    pass: form.newPassword.length >= 8 },
    { label: "One uppercase letter",      pass: /[A-Z]/.test(form.newPassword) },
    { label: "One number",               pass: /[0-9]/.test(form.newPassword) },
    { label: "Passwords match",          pass: form.newPassword === form.confirmPassword && form.confirmPassword !== "" },
  ];
  const isValid = checks.every(c => c.pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !userId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/change-password", {
        userId,
        newPassword: form.newPassword,
      });
      router.push("/login?passwordChanged=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-gray-900">MultiShop</span>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={26} className="text-yellow-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Set your password</h2>
          <p className="text-gray-500 text-sm">
            Your account was created with a temporary password.<br />
            Please set a new password to continue.
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.newPassword}
                onChange={e => { setForm(p => ({ ...p, newPassword: e.target.value })); setError(null); }}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-colors"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setError(null); }}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-colors"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {form.newPassword && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${c.pass ? "bg-green-500" : "bg-gray-200"}`}>
                    {c.pass && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${c.pass ? "text-green-600" : "text-gray-400"}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={!isValid || isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all mt-2
              ${isValid && !isSubmitting
                ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-200 hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
            {isSubmitting
              ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : "Set Password & Continue"
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    }>
      <ChangePasswordForm />
    </Suspense>
  );
}
