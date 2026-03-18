"use client";
import Link from "next/link";
import {
  Store, Home, ArrowLeft, Search,
  ShoppingBag, Compass, MapPin, Frown,
} from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* Animated 404 Text */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-black leading-none select-none">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              404
            </span>
          </h1>

          {/* Floating Elements */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 rotate-12">
              <Frown size={32} className="text-white" />
            </div>
          </div>

          <div className="absolute -bottom-4 right-20 animate-pulse">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-amber-200">
              <Store size={20} className="text-amber-500" />
            </div>
          </div>

          <div className="absolute top-20 left-10 animate-spin-slow">
            <div className="w-8 h-8 bg-orange-100 rounded-lg rotate-45" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Page Not Found
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
          </p>
        </div>



      

       
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
