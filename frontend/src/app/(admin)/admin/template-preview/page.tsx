"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, ChevronDown, Star, Percent, ShoppingCart, ImageIcon } from "lucide-react";
import { THEMES } from "@/config/themes";
import { TEMPLATE_LIST } from "@/config/templates";
import { getTemplate } from "@/components/store/templates";
import { StoreData } from "@/components/providers/StoreProvider";

// Mock store data for preview
const MOCK_STORE: StoreData = {
  storeName: "Demo Store",
  subdomain: "demo",
  theme: "sunrise",
  template: "template1",
  branding: {
    logo: null,
    tagline: "Discover amazing products at unbeatable prices",
    primaryColor: "", secondaryColor: "", accentColor: "", bgColor: "",
    navBg: "", navText: "", buttonBg: "", buttonText: "", borderColor: "",
  },
  contact: { email: "hello@demo.com", phone: "+977 9800000000" },
};

const MOCK_PRODUCTS = [
  { _id: "1", name: "Classic Cotton T-Shirt", description: "Soft premium cotton tee", price: 1200, compareAtPrice: null, category: "Clothing", images: [], stock: 25, discountPercent: 0, isFeatured: true, effectivePrice: 1200 },
  { _id: "2", name: "Running Shoes Pro", description: "Lightweight running shoes", price: 4500, compareAtPrice: 5500, category: "Footwear", images: [], stock: 8, discountPercent: 20, isFeatured: true, effectivePrice: 3600 },
  { _id: "3", name: "Wireless Headphones", description: "Noise-cancelling over-ear", price: 3200, compareAtPrice: null, category: "Electronics", images: [], stock: 15, discountPercent: 0, isFeatured: false, effectivePrice: 3200 },
  { _id: "4", name: "Leather Backpack", description: "Premium leather daily carry", price: 6800, compareAtPrice: 8000, category: "Accessories", images: [], stock: 3, discountPercent: 15, isFeatured: true, effectivePrice: 5780 },
  { _id: "5", name: "Organic Face Cream", description: "Natural skincare solution", price: 980, compareAtPrice: null, category: "Beauty", images: [], stock: 0, discountPercent: 0, isFeatured: false, effectivePrice: 980 },
  { _id: "6", name: "Smart Watch Elite", description: "Fitness and health tracker", price: 8500, compareAtPrice: 9500, category: "Electronics", images: [], stock: 12, discountPercent: 10, isFeatured: true, effectivePrice: 7650 },
];

function PreviewContent() {
  const searchParams = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState(searchParams.get("template") || "template1");
  const [selectedTheme, setSelectedTheme] = useState(searchParams.get("theme") || "sunrise");

  const theme = THEMES[selectedTheme] || THEMES.sunrise;
  const { HeroSection, ProductCard, FeaturedSection, SaleSection, NavbarLayout, FooterLayout } = getTemplate(selectedTemplate);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgColor }}>
      {/* Preview Control Bar */}
      <div className="sticky top-0 z-[100] bg-gray-900 text-white px-4 py-3 flex items-center gap-4 flex-wrap shadow-xl">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-amber-400" />
          <span className="text-sm font-bold">Template Preview</span>
        </div>

        {/* Template Selector */}
        <div className="relative">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="bg-gray-800 text-white text-sm font-semibold px-3 py-2 pr-8 rounded-lg border border-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-amber-400"
          >
            {TEMPLATE_LIST.map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Theme Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Theme:</span>
          <div className="flex gap-1">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedTheme === key ? "border-white scale-125" : "border-transparent opacity-60 hover:opacity-100"}`}
                style={{ backgroundColor: t.primaryColor }}
                title={t.name}
              />
            ))}
          </div>
        </div>

        <span className="text-xs text-gray-500 ml-auto">This is a preview — no real data</span>
      </div>

      {/* Simulated Store Preview */}
      <div>
        {/* We can't render NavbarLayout/FooterLayout in preview easily since they use useStore()
            So render a simulated navbar */}
        <nav style={{ backgroundColor: theme.navBg }} className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                D
              </div>
              <span className="font-black" style={{ color: theme.navText }}>Demo Store</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold opacity-70" style={{ color: theme.navText }}>Shop</span>
              <ShoppingCart size={18} style={{ color: theme.navText }} />
            </div>
          </div>
        </nav>

        {/* Hero — use template-specific if it doesn't need useStore, otherwise simulate */}
        <section className="relative overflow-hidden" style={{ backgroundColor: theme.navBg }}>
          {selectedTemplate === "template1" && (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
              <h1 className="text-5xl font-black mb-4" style={{ color: theme.navText }}>Welcome to Demo Store</h1>
              <p className="text-lg opacity-70 mb-6" style={{ color: theme.navText }}>Discover amazing products at unbeatable prices</p>
              <span className="inline-flex px-6 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>Shop Now</span>
            </div>
          )}
          {selectedTemplate === "template2" && (
            <div className="max-w-7xl mx-auto px-6 py-28 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
              <h1 className="text-7xl font-black mb-4 relative" style={{ color: theme.navText }}>Demo Store</h1>
              <p className="text-xl opacity-70 mb-8 relative" style={{ color: theme.navText }}>Discover amazing products</p>
              <span className="relative inline-flex px-8 py-4 rounded-full font-bold" style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>Explore Collection</span>
            </div>
          )}
          {selectedTemplate === "template3" && (
            <div className="max-w-7xl mx-auto px-6 py-12" style={{ backgroundColor: theme.bgColor }}>
              <h1 className="text-4xl font-black" style={{ color: theme.textColor }}>Demo Store</h1>
              <p className="text-lg text-gray-500 mt-2">Discover amazing products at unbeatable prices</p>
              <div className="mt-4 border-b" style={{ borderColor: theme.borderColor }} />
            </div>
          )}
          {selectedTemplate === "template4" && (
            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 gap-8 items-center" style={{ backgroundColor: theme.bgColor }}>
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.secondaryColor }}>
                <span className="text-9xl font-black opacity-10" style={{ color: theme.primaryColor }}>D</span>
              </div>
              <div>
                <h1 className="text-5xl font-black uppercase mb-4" style={{ color: theme.textColor }}>Demo Store</h1>
                <p className="text-lg text-gray-500 mb-6">Discover amazing products</p>
                <span className="inline-flex px-8 py-4 rounded-full font-black uppercase tracking-wider" style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>Shop Now</span>
              </div>
            </div>
          )}
          {selectedTemplate === "template5" && (
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
              <p className="text-sm tracking-[0.3em] uppercase opacity-60 mb-4" style={{ color: theme.navText }}>Welcome to</p>
              <h1 className="text-6xl font-black mb-6" style={{ color: theme.navText }}>Demo Store</h1>
              <p className="text-lg opacity-60 mb-8" style={{ color: theme.navText }}>Curated collection of premium products</p>
              <span className="inline-flex px-8 py-3 rounded-xl font-bold tracking-wider text-sm" style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>Discover</span>
              <div className="flex justify-center gap-2 mt-8">
                {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "opacity-100" : "opacity-30"}`} style={{ backgroundColor: theme.navText }} />)}
              </div>
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-6">
            <Star size={20} className="fill-yellow-400 text-yellow-400" />
            <h2 className="text-2xl font-black" style={{ color: theme.textColor }}>Featured Products</h2>
          </div>
          <div className={`grid gap-6 ${selectedTemplate === "template3" ? "grid-cols-1 sm:grid-cols-2" : selectedTemplate === "template4" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
            {MOCK_PRODUCTS.filter(p => p.isFeatured).map((product) => (
              <ProductCard key={product._id} product={product} theme={theme} />
            ))}
          </div>
        </section>

        {/* Sale Products Section */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
              <Percent size={16} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black" style={{ color: theme.textColor }}>On Sale</h2>
          </div>
          <div className={`grid gap-6 ${selectedTemplate === "template3" ? "grid-cols-1 sm:grid-cols-2" : selectedTemplate === "template4" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
            {MOCK_PRODUCTS.filter(p => p.discountPercent > 0).map((product) => (
              <ProductCard key={product._id} product={product} theme={theme} />
            ))}
          </div>
        </section>

        {/* All Products */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-black mb-6" style={{ color: theme.textColor }}>All Products</h2>
          <div className={`grid gap-6 ${selectedTemplate === "template3" ? "grid-cols-1 sm:grid-cols-2" : selectedTemplate === "template4" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product._id} product={product} theme={theme} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t mt-8" style={{ borderColor: theme.borderColor, backgroundColor: theme.cardBg }}>
          <div className="max-w-7xl mx-auto px-6 py-8 text-center">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Demo Store. Template Preview.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function TemplatePreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>}>
      <PreviewContent />
    </Suspense>
  );
}
