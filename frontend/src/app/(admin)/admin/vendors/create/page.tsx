"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store, Mail, User, Phone, Globe,
  ArrowLeft, Check, AlertCircle, Loader2, Palette,
  Sparkles, Shield, Rocket, Crown, Eye,
} from "lucide-react";
import api from "@/lib/axios";
import { THEMES } from "@/config/themes";

const plans = [
  { 
    value: "basic", 
    label: "Basic", 
    price: "Free", 
    icon: Store,
    color: "from-gray-500 to-gray-600",
    features: ["Up to 50 products", "Basic analytics", "Email support", "Custom domain"] 
  },
  { 
    value: "pro", 
    label: "Pro", 
    price: "$29/mo", 
    icon: Rocket,
    color: "from-blue-500 to-blue-600",
    features: ["Up to 500 products", "Advanced analytics", "Priority support", "API access", "Bulk editing"] 
  },
  { 
    value: "premium", 
    label: "Premium", 
    price: "$99/mo", 
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    features: ["Unlimited products", "Full analytics suite", "Dedicated support", "Advanced API", "Custom reports", "White-label"] 
  },
];

export default function CreateVendorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    storeName: "", subdomain: "", plan: "basic", theme: "sunrise",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: "" }));
    if (apiError) setApiError(null);
    
    // Auto-generate subdomain from store name
    if (field === "storeName") {
      const sub = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setForm(p => ({ ...p, storeName: value, subdomain: sub }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Owner name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address";
    if (!form.storeName.trim()) e.storeName = "Store name is required";
    if (!form.subdomain.trim()) e.subdomain = "Subdomain is required";
    if (!/^[a-z0-9-]+$/.test(form.subdomain)) e.subdomain = "Only lowercase letters, numbers, and hyphens allowed";
    if (form.subdomain.length < 3) e.subdomain = "Subdomain must be at least 3 characters";
    if (form.phone && !/^[0-9+\-\s()]{10,}$/.test(form.phone)) e.phone = "Please enter a valid phone number";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const { data } = await api.post("/admin/vendors", form);
      setSuccess(data.vendor);
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to create vendor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTheme = THEMES[form.theme];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green-200">
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-2">🎉 Vendor Created Successfully!</h2>
        <p className="text-gray-500 mb-8 text-lg">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
            {success.storeName}
          </span> has been added to your platform
        </p>

        {/* Credentials Card */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 mb-8 text-left shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-amber-500" />
            <h3 className="font-bold text-gray-700">Vendor Credentials</h3>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full ml-auto">Sent to email</span>
          </div>

          <div className="space-y-4">
            {[
              { label: "Store URL", value: success.storeUrl, link: true, icon: Globe },
              { label: "Subdomain", value: success.subdomain, icon: Store },
              { label: "Plan", value: success.plan, icon: Crown, capitalize: true },
              { label: "Theme", value: THEMES[success.theme]?.name || success.theme, icon: Palette },
              { label: "Owner Name", value: success.ownerName, icon: User },
              { label: "Owner Email", value: success.ownerEmail, icon: Mail },
            ].map(({ label, value, link, icon: Icon, capitalize }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{label}</span>
                </div>
                {link ? (
                  <a 
                    href={value} 
                    target="_blank" 
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                  >
                    {value}
                    <Eye size={12} />
                  </a>
                ) : (
                  <span className={`text-sm font-semibold text-gray-900 ${capitalize ? "capitalize" : ""}`}>
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <Sparkles size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <span>Login credentials have been sent to the vendor's email. They can log in using their store URL.</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => { 
              setSuccess(null); 
              setForm({ name: "", email: "", phone: "", storeName: "", subdomain: "", plan: "basic", theme: "sunrise" }); 
            }}
            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
          >
            Create Another Vendor
          </button>
          <Link 
            href="/admin/vendors" 
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-center transition-all shadow-lg shadow-orange-200"
          >
            View All Vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Breadcrumb */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/vendors"
          className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900">Create New Vendor</h1>
            <div className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
              <span className="text-xs font-bold text-amber-700">New Store</span>
            </div>
          </div>
          <p className="text-gray-500 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            Set up a new vendor store with custom theme and subscription plan
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="mb-6 flex items-start gap-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5 animate-shake">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Error Creating Vendor</p>
            <p className="text-red-500 text-xs mt-1">{apiError}</p>
          </div>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Owner Information Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User size={18} className="text-amber-500" />
              <h2 className="font-black text-gray-900">Owner Information</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-auto">Primary Contact</span>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm ${errors.name ? '!opacity-100 !from-red-400 !to-red-500' : ''}`} />
                  <div className="relative">
                    <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500'}`} />
                    <input 
                      type="text" 
                      placeholder="Vendor Name" 
                      value={form.name}
                      onChange={e => handleChange("name", e.target.value)}
                      className={`w-full pl-11 pr-4 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                        ${errors.name 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-amber-400'
                        }`}
                    />
                  </div>
                </div>
                {errors.name && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm ${errors.email ? '!opacity-100 !from-red-400 !to-red-500' : ''}`} />
                  <div className="relative">
                    <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500'}`} />
                    <input 
                      type="email" 
                      placeholder="vendor@example.com" 
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                      className={`w-full pl-11 pr-4 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                        ${errors.email 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-amber-400'
                        }`}
                    />
                  </div>
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.email}</p>}
              </div>

              {/* Phone - Optional but validated */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 font-normal"></span>
                </label>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm ${errors.phone ? '!opacity-100 !from-red-400 !to-red-500' : ''}`} />
                  <div className="relative">
                    <Phone size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.phone ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500'}`} />
                    <input 
                      type="tel" 
                      placeholder="+91 0000 0000" 
                      value={form.phone}
                      onChange={e => handleChange("phone", e.target.value)}
                      className={`w-full pl-11 pr-4 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                        ${errors.phone 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-amber-400'
                        }`}
                    />
                  </div>
                </div>
                {errors.phone && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.phone}</p>}
                {!errors.phone && form.phone && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check size={10} /> Valid phone number</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Information Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-amber-500" />
              <h2 className="font-black text-gray-900">Store Information</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Store Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Store Name <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm ${errors.storeName ? '!opacity-100 !from-red-400 !to-red-500' : ''}`} />
                <div className="relative">
                  <Store size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.storeName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500'}`} />
                  <input 
                    type="text" 
                    placeholder="e.g., Fashion Hub" 
                    value={form.storeName}
                    onChange={e => handleChange("storeName", e.target.value)}
                    className={`w-full pl-11 pr-4 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white
                      ${errors.storeName 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-amber-400'
                      }`}
                  />
                </div>
              </div>
              {errors.storeName && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.storeName}</p>}
            </div>

            {/* Subdomain with live preview */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Subdomain <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm ${errors.subdomain ? '!opacity-100 !from-red-400 !to-red-500' : ''}`} />
                <div className="relative">
                  <Globe size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.subdomain ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500'}`} />
                  <input 
                    type="text" 
                    placeholder="fashion-hub" 
                    value={form.subdomain}
                    onChange={e => handleChange("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className={`w-full pl-11 pr-4 py-4 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-gray-50 focus:bg-white font-mono
                      ${errors.subdomain 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-amber-400'
                      }`}
                  />
                </div>
              </div>
              
              {/* Live URL Preview */}
              {form.subdomain && !errors.subdomain && (
                <div className="mt-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <Globe size={12} className="text-amber-500" />
                    <span>Store URL:</span>
                    <code className="text-sm font-bold text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {form.subdomain}.multistore.com
                    </code>
                    <span className="text-xs text-gray-400 ml-auto">Auto-generated</span>
                  </p>
                </div>
              )}
              
              {errors.subdomain && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.subdomain}</p>}
            </div>
          </div>
        </div>

        {/* Theme Selection Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-amber-500" />
              <h2 className="font-black text-gray-900">Store Theme</h2>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="ml-auto text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Eye size={14} />
                {previewMode ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Live Theme Preview */}
            {previewMode && (
              <div className="mb-6 rounded-xl overflow-hidden border-2 shadow-lg transition-all"
                style={{ borderColor: selectedTheme.primaryColor }}>
                {/* Store Header */}
                <div className="h-12 flex items-center px-5 gap-3" style={{ backgroundColor: selectedTheme.navBg }}>
                  <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: selectedTheme.primaryColor }} />
                  <span className="text-sm font-bold" style={{ color: selectedTheme.navText }}>
                    {form.storeName || "Your Store Name"}
                  </span>
                  <span className="text-xs ml-auto px-2 py-1 rounded-full" style={{ backgroundColor: selectedTheme.buttonBg, color: selectedTheme.buttonText }}>
                    {selectedTheme.name}
                  </span>
                </div>
                
                {/* Store Content */}
                <div className="p-5 flex items-start gap-4" style={{ backgroundColor: selectedTheme.bgColor }}>
                  <div className="w-20 h-20 rounded-xl" style={{ backgroundColor: selectedTheme.secondaryColor, border: `2px solid ${selectedTheme.borderColor}` }} />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 rounded-full w-3/4" style={{ backgroundColor: selectedTheme.borderColor }} />
                    <div className="h-3 rounded-full w-1/2" style={{ backgroundColor: selectedTheme.borderColor }} />
                    <div className="flex gap-2 mt-2">
                      <div className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: selectedTheme.buttonBg, color: selectedTheme.buttonText }}>
                        Add to Cart
                      </div>
                      <div className="px-4 py-2 rounded-lg text-xs font-bold border-2" style={{ borderColor: selectedTheme.borderColor, color: selectedTheme.textColor }}>
                        View Details
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.entries(THEMES).map(([key, theme]) => {
                const isSelected = form.theme === key;
                return (
                  <button 
                    key={key} 
                    type="button" 
                    onClick={() => handleChange("theme", key)}
                    className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? 'border-amber-400 bg-amber-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                      }`}
                  >
                    {/* Theme Color Preview */}
                    <div className="w-full h-12 rounded-lg overflow-hidden flex shadow-sm">
                      <div className="flex-1" style={{ backgroundColor: theme.navBg }} />
                      <div className="flex-1" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="flex-1" style={{ backgroundColor: theme.secondaryColor }} />
                    </div>
                    
                    <div className="text-center">
                      <span className="text-sm font-bold text-gray-700 block">{theme.name}</span>
                      <span className="text-xs text-gray-400">Theme</span>
                    </div>

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/0 to-orange-500/0 group-hover:from-amber-400/5 group-hover:to-orange-500/5 transition-all" />
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              The selected theme will be applied to the vendor's storefront and cannot be changed by the vendor.
            </p>
          </div>
        </div>

        {/* Plan Selection Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Rocket size={18} className="text-amber-500" />
              <h2 className="font-black text-gray-900">Subscription Plan</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map(plan => {
                const Icon = plan.icon;
                const isSelected = form.plan === plan.value;
                
                return (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => handleChange("plan", plan.value)}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all group
                      ${isSelected 
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl scale-[1.02]' 
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                      }`}
                  >
                    {/* Plan Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>

                    {/* Plan Name & Price */}
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-gray-900">{plan.label}</h3>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                        {plan.price}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check size={12} className="text-green-500 mt-0.5 shrink-0" strokeWidth={3} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {/* Popular Badge for Pro */}
                    {plan.value === "pro" && !isSelected && (
                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-[10px] font-bold text-white">
                        Popular
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Plan Info Note */}
            <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-700 flex items-start gap-2">
                <Shield size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span>The selected plan determines the vendor's feature access and monthly billing. Plan can be upgraded later.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Link
            href="/admin/vendors"
            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all relative overflow-hidden group
              ${!isSubmitting 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-200 hover:shadow-2xl hover:scale-[1.02]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Vendor...
              </>
            ) : (
              <>
                <Store size={18} className="group-hover:scale-110 transition-transform" />
                Create Vendor & Send Credentials
                <Rocket size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
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