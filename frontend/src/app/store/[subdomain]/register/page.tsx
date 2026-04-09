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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme?.navBg || "#f8fafc" }}>
        <div className="relative">
          <div className="w-12 h-12 border-3 border-gray-200 rounded-full" />
          <div className="absolute top-0 w-12 h-12 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: theme?.primaryColor || "#000", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (userId) {
    return <OTPStep userId={userId} email={form.email} theme={theme} store={store} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
      style={{ backgroundColor: theme.navBg }}>
      
      {/* Simple Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, ${theme.primaryColor}08 1px, transparent 1px),
              linear-gradient(to bottom, ${theme.primaryColor}08 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} 
        />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${theme.primaryColor}10 0px, ${theme.primaryColor}10 1px, transparent 1px, transparent 20px)`
          }}
        />
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
                <p className="text-xs text-white/60">Join our community</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit">
                <Sparkles size={14} className="text-white" />
                <span className="text-xs font-medium text-white">Get Started Today</span>
              </div>
              
              <h1 className="text-4xl font-bold text-white leading-tight">
                Create your
                <span className="block mt-2" style={{ color: theme.primaryColor }}>
                  account now
                </span>
              </h1>
              
              <p className="text-white/70 leading-relaxed">
                {store.branding.tagline || `Join ${store.storeName} and unlock exclusive benefits, track orders, and enjoy a personalized shopping experience.`}
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  "Free to join",
                  "Exclusive deals",
                  "Fast checkout",
                  "Order tracking",
                  "Member rewards",
                  "24/7 support"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/80 group cursor-default">
                    <div className="transform transition-transform group-hover:scale-110">
                      <Check size={12} />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - Removed Sign In Link from here */}
            <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in">
              <p className="text-xs text-white/50">
                © 2024 {store.storeName}. All rights reserved.
              </p>
            </div>
          </div>

          {/* Right Side - Registration Form Card */}
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
                <p className="text-xs text-gray-500">Create your account</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-sm text-gray-500">Join us and start shopping today</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ borderColor: '#e5e7eb' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ borderColor: '#e5e7eb' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Phone & Age Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="9800000000"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                      style={{ borderColor: '#e5e7eb' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.primaryColor;
                        e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    min={13}
                    max={120}
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ borderColor: '#e5e7eb' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ borderColor: '#e5e7eb' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
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

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                    style={{ 
                      borderColor: form.confirmPassword 
                        ? (doPasswordsMatch ? '#22c55e' : '#ef4444')
                        : '#e5e7eb'
                    }}
                    onFocus={(e) => {
                      if (!form.confirmPassword) e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      if (!form.confirmPassword) e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {form.confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${doPasswordsMatch ? 'bg-green-500' : 'bg-red-500'}`}>
                      {doPasswordsMatch && <Check size={8} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              {form.password && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Password requirements:</p>
                  <div className="space-y-1">
                    {passwordChecks.map((c) => (
                      <div key={c.label} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${c.pass ? "bg-green-500" : "bg-gray-200"}`}>
                          {c.pass && <Check size={8} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-xs ${c.pass ? "text-green-600" : "text-gray-400"}`}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms & Privacy */}
              <div className="flex items-start gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 transition-all"
                  style={{ 
                    accentColor: theme.primaryColor,
                    focusRingColor: theme.primaryColor
                  }} 
                />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
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
                className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                style={{ 
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonText
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link - Now prominently placed at the bottom of the form card */}
            <div className="mt-6 pt-4 text-center border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-semibold hover:underline transition-all duration-200"
                  style={{ color: theme.primaryColor }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        @keyframes floatDelayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
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

// OTP Verification Component
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
      style={{ backgroundColor: theme.navBg }}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, ${theme.primaryColor}08 1px, transparent 1px),
              linear-gradient(to bottom, ${theme.primaryColor}08 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} 
        />
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl animate-float-slow"
          style={{ backgroundColor: `${theme.primaryColor}15` }} />
      </div>

      {/* OTP Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: theme.primaryColor }}>
              <Mail size={32} style={{ color: theme.buttonText }} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
          <p className="text-sm text-gray-500 mb-2">We sent a verification code to</p>
          <p className="font-semibold text-sm mb-6" style={{ color: theme.primaryColor }}>{email}</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

          {/* OTP Input */}
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => { 
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); 
              setError(null); 
            }}
            className="w-full text-center text-2xl font-bold tracking-[0.3em] py-3 border rounded-lg focus:outline-none transition-all duration-200 mb-6"
            style={{ borderColor: '#e5e7eb' }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primaryColor;
              e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isSubmitting}
            className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
            style={{ 
              backgroundColor: theme.primaryColor,
              color: theme.buttonText
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Resend Link */}
          <p className="text-xs text-gray-500">
            Didn't receive it?{" "}
            {resent ? (
              <span className="text-green-600 font-semibold">✓ Code resent</span>
            ) : (
              <button 
                onClick={handleResend} 
                className="font-semibold hover:underline"
                style={{ color: theme.primaryColor }}
              >
                Resend code
              </button>
            )}
          </p>

          {/* Back Link */}
          <Link 
            href="/login" 
            className="inline-block mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>

      <style jsx>{`
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
        
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}