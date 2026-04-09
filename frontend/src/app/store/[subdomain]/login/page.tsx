"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, 
  Sparkles, Shield, ShoppingBag, UserPlus
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";

export default function StoreLoginPage() {
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);
  const { store, themeColors: theme, loading, error: storeError } = useStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme?.navBg || "#f8fafc" }}>
        <div className="relative">
          <div className="w-12 h-12 border-3 border-gray-200 rounded-full" />
          <div className="absolute top-0 w-12 h-12 border-3 border-t-transparent rounded-full animate-spin"
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
      style={{ backgroundColor: theme.navBg }}>
      
      {/* Simple Background Pattern */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, ${theme.primaryColor}08 1px, transparent 1px),
              linear-gradient(to bottom, ${theme.primaryColor}08 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} 
        />
        
        {/* Simple diagonal lines */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${theme.primaryColor}10 0px, ${theme.primaryColor}10 1px, transparent 1px, transparent 20px)`
          }}
        />
        
        {/* Floating elements with simple fade animation */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl animate-float-slow"
          style={{ backgroundColor: `${theme.primaryColor}15` }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float-delayed"
          style={{ backgroundColor: `${theme.primaryColor}10` }} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex flex-col justify-between p-8 rounded-2xl backdrop-blur-xl bg-white/10"
            style={{ border: `1px solid ${theme.primaryColor}20` }}>
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-8 animate-slide-down">
              {store.branding.logo ? (
                <img src={store.branding.logo} alt={store.storeName} className="h-12 w-auto" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl"
                  style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                  {store.storeName[0].toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{store.storeName}</h2>
                <p className="text-xs text-white/60">Your trusted shopping partner</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit">
                <Sparkles size={14} className="text-white" />
                <span className="text-xs font-medium text-white">Welcome Back!</span>
              </div>
              
              <h1 className="text-4xl font-bold text-white leading-tight">
                Sign in to continue
                <span className="block mt-2" style={{ color: theme.primaryColor }}>
                  your journey
                </span>
              </h1>
              
              <p className="text-white/70 leading-relaxed">
                {store.branding.tagline || `Access your account to track orders, manage subscriptions, and enjoy a personalized shopping experience at ${store.storeName}.`}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  { icon: Shield, label: "Secure Access" },
                  { icon: ShoppingBag, label: "Easy Shopping" },
                  { icon: Sparkles, label: "Best Deals" },
                  { icon: UserPlus, label: "Quick Support" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/80 group cursor-default">
                    <div className="transform transition-transform group-hover:scale-110">
                      <item.icon size={14} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in">
              <p className="text-xs text-white/50">
                © 2024 {store.storeName}. All rights reserved.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-slide-up">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              {store.branding.logo ? (
                <img src={store.branding.logo} alt={store.storeName} className="h-10 w-auto" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                  style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                  {store.storeName[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{store.storeName}</h3>
                <p className="text-xs text-gray-500">Sign in to your account</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500">Please enter your credentials to sign in</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 animate-shake">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700 text-xs font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" 
                    style={{ color: error ? '#ef4444' : undefined }} />
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={form.email}
                    onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(null); }}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ 
                      borderColor: error ? '#fecaca' : '#e5e7eb',
                      backgroundColor: error ? '#fef2f2' : 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium hover:underline transition-all duration-200"
                    style={{ color: theme.primaryColor }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(null); }}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ 
                      borderColor: error ? '#fecaca' : '#e5e7eb',
                      backgroundColor: error ? '#fef2f2' : 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!form.email || !form.password || isSubmitting}
                className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ 
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonText
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 pt-4 text-center border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="font-semibold hover:underline transition-all duration-200"
                  style={{ color: theme.primaryColor }}
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes floatSlow {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, -20px);
          }
        }
        
        @keyframes floatDelayed {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, 20px);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
        
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}