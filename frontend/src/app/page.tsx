"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, Store, Users, TrendingUp, Shield, Zap,
  ChevronRight, Star, Globe, CreditCard, Package, Truck,
  BarChart3, Smartphone, Clock, CheckCircle, ArrowRight,
  Menu, X, Sparkles, Rocket, Crown, Phone, Mail,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-5"
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">
              Multi<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Store</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Success Stories</a>
            <Link 
              href="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span>Login</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 py-4 px-6">
            <div className="flex flex-col gap-3">
              <a href="#features" className="py-3 text-gray-600 hover:text-orange-500 font-medium border-b border-gray-100">Features</a>
              <a href="#pricing" className="py-3 text-gray-600 hover:text-orange-500 font-medium border-b border-gray-100">Pricing</a>
              <a href="#testimonials" className="py-3 text-gray-600 hover:text-orange-500 font-medium border-b border-gray-100">Success Stories</a>
              <Link 
                href="/login"
                className="mt-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl text-center"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-amber-50 to-orange-50 rounded-bl-[100px] -z-10" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-orange-200 rounded-full opacity-20 blur-3xl -z-10" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl -z-10" />

        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">The Ultimate Multi-Vendor Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black leading-tight">
                Launch Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Ecommerce Empire
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg">
                Create your own branded online store in minutes. No coding required. Start selling to millions of customers today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-xl shadow-orange-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  Get Started Free
                  <Rocket className="w-5 h-5" />
                </Link>
                <Link 
                  href="/demo"
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-orange-400 hover:text-orange-500 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Watch Demo
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Ratings */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center text-white font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">10,000+ Successful Stores</p>
                <p className="text-gray-500">Join thousands of entrepreneurs who built their dream business with us</p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-black text-orange-500">$2.5B+</p>
                    <p className="text-sm text-gray-600">GMV Processed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-black text-orange-500">50M+</p>
                    <p className="text-sm text-gray-600">Customers Served</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-400 rounded-2xl rotate-12 flex items-center justify-center shadow-xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                Scale Your Business
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features that help you create, manage, and grow your online store
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Store, title: "Multi-Vendor", desc: "Create unlimited vendor stores under your platform", color: "from-amber-400 to-orange-500" },
              { icon: Globe, title: "Custom Domain", desc: "Use your own domain name with free SSL certificate", color: "from-orange-400 to-amber-500" },
              { icon: CreditCard, title: "Secure Payments", desc: "Accept payments via multiple gateways securely", color: "from-amber-400 to-orange-500" },
              { icon: Package, title: "Inventory Management", desc: "Track stock levels across all your stores", color: "from-orange-400 to-amber-500" },
              { icon: Truck, title: "Shipping Integration", desc: "Connect with major shipping carriers", color: "from-amber-400 to-orange-500" },
              { icon: BarChart3, title: "Analytics", desc: "Real-time insights into your business performance", color: "from-orange-400 to-amber-500" },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
              {[
                { number: "10K+", label: "Active Stores" },
                { number: "50M+", label: "Products Sold" },
                { number: "99.9%", label: "Uptime" },
                { number: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-4xl font-black mb-2">{stat.number}</p>
                  <p className="text-amber-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Trusted by
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                Thousands of Store Owners
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Fashion Store Owner", quote: "Revenue increased by 300% in just 6 months. Best platform for scaling your business!" },
              { name: "Mike Chen", role: "Electronics Retailer", quote: "The multi-vendor feature helped me expand to 5 new cities. Absolutely game-changing." },
              { name: "Emily Rodriguez", role: "Handmade Crafts", quote: "From side hustle to full-time business. Couldn't have done it without this platform." },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-gray-100">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Ready to Start Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                Ecommerce Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 10,000+ successful store owners. Start your 14-day free trial today.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-xl shadow-orange-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
            >
              Create Your Store Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-400 mt-4">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black">MultiStore</span>
              </div>
              <p className="text-gray-400 text-sm">
                The ultimate platform for launching and scaling your multi-vendor ecommerce business.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Integrations", "API"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Contact", "Documentation", "Status"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold mb-4 text-amber-400">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 MultiStore. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}