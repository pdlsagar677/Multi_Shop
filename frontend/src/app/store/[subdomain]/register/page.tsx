"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, 
  ArrowRight, AlertCircle, Check, Shield, Sparkles 
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

export default function StoreRegisterPage() {
  const router = useRouter();
  const { store, themeColors: theme } = useStore();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    phone: "", 
    age: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const passwordChecks = [
    { label: "At least 8 characters", pass: form.password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(form.password) },
    { label: "One number", pass: /[0-9]/.test(form.password) },
  ];
  
  const isPasswordValid = passwordChecks.every((c) => c.pass);
  const doPasswordsMatch = form.password === form.confirmPassword && form.confirmPassword !== "";
  const isFormValid = form.name && form.email && isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doPasswordsMatch) {
      setError("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        age: form.age ? parseInt(form.age) : undefined,
      });
      if (data?.userId) setUserId(data.userId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: theme?.primaryColor || "#000", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (userId) {
    return <OTPStep userId={userId} email={form.email} theme={theme} store={store} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Brand Side */}
      <div className="lg:w-1/2 relative overflow-hidden flex flex-col" style={{ backgroundColor: theme.navBg }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: theme.primaryColor }} />
          <div className="absolute bottom-0 -right-4 w-96 h-96 rounded-full opacity-10 animate-pulse delay-1000"
            style={{ backgroundColor: theme.primaryColor }} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 xl:p-16">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl opacity-20 blur-md" />
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                {store.storeName[0].toUpperCase()}
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block" style={{ color: theme.navText }}>
                {store.storeName}
              </span>
              <span className="text-sm opacity-60 flex items-center gap-1" style={{ color: theme.navText }}>
                <Shield size={12} />
                Join our community
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <Sparkles size={14} style={{ color: theme.primaryColor }} />
                <span className="text-sm font-medium" style={{ color: theme.navText }}>
                  Get started in minutes
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight" style={{ color: theme.navText }}>
                Join Our
                <span className="block mt-2" style={{ color: theme.primaryColor }}>
                  Shopping Family
                </span>
              </h1>

              <p className="text-lg opacity-70 leading-relaxed" style={{ color: theme.navText }}>
                {store.branding.tagline || `Create your account and unlock exclusive benefits at ${store.storeName}.`}
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  "Free to join",
                  "Exclusive deals",
                  "Fast checkout",
                  "Order tracking",
                  "Member rewards",
                  "24/7 support"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                      <Check size={12} style={{ color: theme.primaryColor }} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: theme.navText }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8">
            <div className="p-5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-sm" style={{ color: theme.navText }}>
                Already a member?{" "}
                <Link href="/login" className="font-bold inline-flex items-center gap-1 group"
                  style={{ color: theme.primaryColor }}>
                  Sign in here
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 xl:p-16 bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg"
              style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
              {store.storeName[0].toUpperCase()}
            </div>
            <div>
              <span className="text-xl font-black text-gray-900">{store.storeName}</span>
              <p className="text-xs text-gray-400">Create your account</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-4">
              <Shield size={12} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-600">SECURE REGISTRATION</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500">Join {store.storeName} and start shopping</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5 animate-shake">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Registration Failed</p>
                <p className="text-red-500 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"
                  style={{ background: `linear-gradient(to right, ${theme.primaryColor}40, ${theme.primaryColor}80)` }} />
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Youe Name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                    onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"
                  style={{ background: `linear-gradient(to right, ${theme.primaryColor}40, ${theme.primaryColor}80)` }} />
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                    onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>
            </div>

            {/* Phone & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Phone <span className="text-gray-400 font-normal"></span>
                </label>
                <div className="relative group">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                    onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Age <span className="text-gray-400 font-normal"></span>
                </label>
                <input
                  type="number"
                  placeholder="25"
                  min={13}
                  max={120}
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"
                  style={{ background: `linear-gradient(to right, ${theme.primaryColor}40, ${theme.primaryColor}80)` }} />
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full pl-11 pr-12 py-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                    onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"
                  style={{ background: `linear-gradient(to right, ${theme.primaryColor}40, ${theme.primaryColor}80)` }} />
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={`w-full pl-11 pr-12 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                      ${form.confirmPassword && (doPasswordsMatch ? 'border-green-500' : 'border-red-500')}`}
                    onFocus={(e) => {
                      if (!form.confirmPassword) e.target.style.borderColor = theme.primaryColor;
                    }}
                    onBlur={(e) => {
                      if (!form.confirmPassword) e.target.style.borderColor = "#e5e7eb";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Password Match Indicator */}
              {form.confirmPassword && (
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${doPasswordsMatch ? 'bg-green-500' : 'bg-red-500'}`}>
                    {doPasswordsMatch ? (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    ) : (
                      <span className="text-white text-xs">!</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {form.password && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Password requirements:</p>
                <div className="space-y-1.5">
                  {passwordChecks.map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${c.pass ? "bg-green-500" : "bg-gray-200"}`}>
                        {c.pass && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-medium ${c.pass ? "text-green-600" : "text-gray-400"}`}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Privacy */}
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
              <label htmlFor="terms" className="text-xs text-gray-500">
                I agree to the{' '}
                <Link href="/terms" className="font-semibold hover:underline" style={{ color: theme.primaryColor }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-semibold hover:underline" style={{ color: theme.primaryColor }}>
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              style={{ 
                background: `linear-gradient(to right, ${theme.buttonBg}, ${theme.primaryColor})`,
                color: theme.buttonText,
                boxShadow: `0 10px 20px -5px ${theme.primaryColor}80`
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Mobile Sign In Link */}
          <p className="lg:hidden text-center text-gray-500 text-sm mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: theme.primaryColor }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

function OTPStep({ userId, email, theme, store }: { userId: string; email: string; theme: any; store: any }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/verify-otp", { userId, otp });
      router.push("/login?verified=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { userId });
      setResent(true);
      setTimeout(() => setResent(false), 30000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bgColor }}>
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          style={{ backgroundColor: theme.primaryColor }}>
          <Mail size={36} style={{ color: theme.buttonText }} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 mb-2">We sent a 6-digit verification code to</p>
        <p className="font-semibold mb-8 text-lg" style={{ color: theme.primaryColor }}>{email}</p>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-left">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }}
          className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:outline-none bg-gray-50 focus:bg-white transition-colors mb-6 text-gray-900"
          onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />

        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isSubmitting}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{ 
            background: `linear-gradient(to right, ${theme.buttonBg}, ${theme.primaryColor})`,
            color: theme.buttonText,
            boxShadow: `0 10px 20px -5px ${theme.primaryColor}80`
          }}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify Email</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="mt-6 text-gray-500 text-sm">
          Didn't receive it?{" "}
          {resent ? (
            <span className="text-green-600 font-semibold">✓ OTP resent</span>
          ) : (
            <button 
              onClick={handleResend} 
              className="font-semibold hover:underline"
              style={{ color: theme.primaryColor }}
            >
              Resend OTP
            </button>
          )}
        </p>

        <Link href="/login" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
