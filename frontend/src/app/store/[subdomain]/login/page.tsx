"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, 
  Sparkles, Shield, ShoppingBag, ChevronRight, Star
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";

export default function StoreLoginPage() {
  const router   = useRouter();
  const setUser  = useAuthStore(s => s.setUser);
  const { store, themeColors: theme, loading, error: storeError } = useStore();
  const [form, setForm]             = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);

      setUser(data.user);
      if (data.user.role === "vendor") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      if (err.response?.data?.requiresPasswordChange) {
        router.push(`/change-password?userId=${err.response.data.userId}`);
        return;
      }
      const msg = err.response?.data?.message || "Login failed.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-500 mb-8">The store you're looking for doesn't exist or is no longer active.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
            Go to Homepage
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Brand Side */}
      <div className="lg:w-1/2 relative overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.navBg }}>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: theme.primaryColor }} />
          <div className="absolute bottom-0 -right-4 w-96 h-96 rounded-full opacity-10 animate-pulse delay-1000"
            style={{ backgroundColor: theme.primaryColor }} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 xl:p-16">
          
          {/* Header with Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl opacity-20 blur-md" />
              {store.branding.logo ? (
                <img 
                  src={store.branding.logo} 
                  alt={store.storeName} 
                  className="relative h-14 w-auto object-contain"
                />
              ) : (
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl"
                  style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                  {store.storeName[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block" style={{ color: theme.navText }}>
                {store.storeName}
              </span>
              <span className="text-sm opacity-60 flex items-center gap-1" style={{ color: theme.navText }}>
                <Shield size={12} />
                Secure Login
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
                  Welcome back to your store
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight" style={{ color: theme.navText }}>
                Your Shopping
                <span className="block mt-2" style={{ color: theme.primaryColor }}>
                  Adventure Awaits
                </span>
              </h1>

              <p className="text-lg opacity-70 leading-relaxed" style={{ color: theme.navText }}>
                {store.branding.tagline || `Sign in to access your account, track orders, and discover amazing products at ${store.storeName}.`}
              </p>

              {/* Store Features */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  { label: "Secure Checkout", icon: Shield },
                  { label: "Best Prices", icon: Sparkles },
                  { label: "Fast Delivery", icon: ShoppingBag },
                  { label: "24/7 Support", icon: Star },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                      <feature.icon size={14} style={{ color: theme.primaryColor }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: theme.navText }}>
                      {feature.label}
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
                New to {store.storeName}?{" "}
                <Link href="/register" className="font-bold inline-flex items-center gap-1 group"
                  style={{ color: theme.primaryColor }}>
                  Create an account
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 xl:p-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">

          {/* Mobile Logo - Only visible on mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg"
              style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
              {store.storeName[0].toUpperCase()}
            </div>
            <div>
              <span className="text-xl font-black text-gray-900">{store.storeName}</span>
              <p className="text-xs text-gray-400">Sign in to continue</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-4">
              <Shield size={12} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-600">SECURE LOGIN</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5 animate-shake">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Login Failed</p>
                <p className="text-red-500 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"
                  style={{ background: `linear-gradient(to right, ${theme.primaryColor}40, ${theme.primaryColor}80)` }} />
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:transition-colors"
                    style={{ color: error ? '#ef4444' : undefined }} />
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={form.email}
                    onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(null); }}
                    className={`w-full pl-11 pr-4 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                      ${error ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-transparent'}`}
                    onFocus={(e) => {
                      if (!error) e.target.style.borderColor = theme.primaryColor;
                    }}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = "#e5e7eb";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-700">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium hover:underline"
                  style={{ color: theme.primaryColor }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"
                  style={{ background: `linear-gradient(to right, ${theme.primaryColor}40, ${theme.primaryColor}80)` }} />
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(null); }}
                    className={`w-full pl-11 pr-12 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                      ${error ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-transparent'}`}
                    onFocus={(e) => {
                      if (!error) e.target.style.borderColor = theme.primaryColor;
                    }}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = "#e5e7eb";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

          

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!form.email || !form.password || isSubmitting}
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>


            
            
          </form>

          {/* Mobile Sign Up Link */}
          <p className="lg:hidden text-center text-gray-500 text-sm mt-8">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold hover:underline"
              style={{ color: theme.primaryColor }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Animations */}
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