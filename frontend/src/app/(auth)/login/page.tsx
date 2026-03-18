"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Eye, EyeOff, Mail, Lock, Store, ArrowRight, 
  AlertCircle, Sparkles, Shield, Zap, Users,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const { login, isSubmitting, error, setError } = useAuth();
  const clearAuth = useAuthStore(s => s.clearAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Clear any stale auth state when landing on login page
  useEffect(() => {
    clearAuth();
  }, [clearAuth]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(form);
  };

  const isValid = form.email && form.password;

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left Panel (Multi-Store Theme) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-2xl rotate-12" />
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-40 h-40 border-4 border-white rotate-45" />
        </div>

        {/* Logo with enhanced design */}
        <div className="relative z-10 flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Store size={24} className="text-orange-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight">Multi</span>
            <span className="text-2xl font-black text-amber-200">Store</span>
          </div>
          <div className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-xs font-bold text-white">Admin</span>
          </div>
        </div>

        {/* Center content with enhanced typography */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <Sparkles size={16} className="text-amber-200" />
            <span className="text-sm font-semibold text-white">Multi-Tenant Platform</span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Manage Your
            <span className="block text-amber-200">Store Empire</span>
          </h1>
          
          <p className="text-amber-100 text-lg leading-relaxed mb-8">
            Centralized dashboard to manage all your vendor stores, track performance, and scale your marketplace.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { icon: Shield, text: "Secure" },
              { icon: Zap, text: "Lightning Fast" },
              { icon: Users, text: "Multi-Vendor" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <feature.icon size={14} className="text-amber-200" />
                <span className="text-sm font-medium text-white">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10K+", label: "Active Stores", color: "from-amber-300 to-amber-400" },
              { value: "50M+", label: "Products", color: "from-orange-300 to-orange-400" },
              { value: "99.9%", label: "Uptime", color: "from-amber-400 to-orange-400" },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-center shadow-lg transform hover:scale-105 transition-transform`}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-white/90 text-xs font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center">
              <Sparkles size={14} className="text-orange-600" />
            </div>
          </div>
          <p className="text-white font-medium text-sm leading-relaxed">
            "MultiStore transformed our business. We've onboarded 500+ vendors in just 3 months. The admin dashboard is pure genius."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
              AK
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Anjali Kapoor</p>
              <p className="text-amber-200 text-xs">Platform Admin, ShopEase</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Login Form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">

          {/* Mobile logo with enhanced design */}
          <div className="lg:hidden flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Store size={20} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-900">Multi</span>
                <span className="text-xl font-black text-orange-500">Store</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-xs font-bold text-gray-600">Admin</span>
            </div>
          </div>

          {/* Heading with enhanced design */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-6">
              <Shield size={14} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-600">SECURE ADMIN ACCESS</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 flex items-center gap-2">
              Sign in to the admin dashboard
              <ArrowRight size={14} className="text-orange-400" />
            </p>
          </div>

          {/* Error Alert with enhanced design */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Authentication Failed</p>
                <p className="text-red-500 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="admin@multistore.com"
                    value={form.email}
                    onChange={e => handleChange("email", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 group"
                >
                  Forgot password?
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => handleChange("password", e.target.value)}
                    className="w-full pl-11 pr-12 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all bg-white"
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

            {/* Submit Button with enhanced design */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group
                ${isValid && !isSubmitting
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-200 hover:shadow-2xl hover:scale-[1.02]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {/* Animated background effect */}
              {isValid && !isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <span className="relative flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Demo Credentials */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400">Multi Store</span>
              </div>
            </div>

            
          </form>

         
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}