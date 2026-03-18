"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search, ChevronLeft, ChevronRight, SlidersHorizontal,
  Package, X, Loader2,
} from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import api from "@/lib/axios";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
}

const LIMIT = 12;

export default function StorePage() {
  const { store, themeColors: theme, loading: storeLoading, error: storeError } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories once
  useEffect(() => {
    if (!store) return;
    api
      .get(`/store/${store.subdomain}/products?limit=100`)
      .then(({ data }) => {
        const cats = [
          ...new Set(
            (data.products || [])
              .map((p: Product) => p.category)
              .filter(Boolean)
          ),
        ] as string[];
        setCategories(cats);
      })
      .catch(() => {});
  }, [store]);

  // Fetch products
  useEffect(() => {
    if (!store) return;
    fetchProducts();
  }, [store, debouncedSearch, category, page]);

  const fetchProducts = async () => {
    if (!store) return;
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== "all") params.category = category;

      const { data } = await api.get(`/store/${store.subdomain}/products`, {
        params,
      });
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-500">This store doesn&apos;t exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: theme.navBg }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: theme.navText }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: theme.navText }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h1
            className="text-3xl sm:text-5xl font-black leading-tight mb-4"
            style={{ color: theme.navText }}
          >
            Welcome to {store.storeName}
          </h1>
          <p
            className="text-base sm:text-lg max-w-lg mx-auto opacity-70"
            style={{ color: theme.navText }}
          >
            {store.branding.tagline || "Discover our amazing collection of products."}
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1">

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-white transition-colors"
              style={{ borderColor: theme.borderColor }}
              onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.borderColor)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-8 py-3 border-2 rounded-xl text-sm text-gray-700 focus:outline-none bg-white appearance-none cursor-pointer min-w-[160px]"
                style={{ borderColor: theme.borderColor }}
                onFocus={(e) =>
                  (e.target.style.borderColor = theme.primaryColor)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = theme.borderColor)
                }
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results info */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {total === 0
                ? "No products found"
                : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total} products`}
            </p>
            {(debouncedSearch || category !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setPage(1);
                }}
                className="text-sm font-semibold flex items-center gap-1 hover:underline"
                style={{ color: theme.primaryColor }}
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.borderColor}`,
                }}
              >
                <div
                  className="aspect-square"
                  style={{ backgroundColor: theme.secondaryColor }}
                />
                <div className="p-4 space-y-3">
                  <div
                    className="h-3 rounded-lg w-1/3"
                    style={{ backgroundColor: theme.borderColor }}
                  />
                  <div
                    className="h-4 rounded-lg w-3/4"
                    style={{ backgroundColor: theme.borderColor }}
                  />
                  <div
                    className="h-5 rounded-lg w-1/2"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={56} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">
              {debouncedSearch || category !== "all"
                ? "No products match your search"
                : "No products available yet"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {debouncedSearch || category !== "all"
                ? "Try adjusting your filters"
                : "Check back soon for new arrivals!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                theme={theme}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: page === 1 ? "#e5e7eb" : theme.primaryColor,
                color: page === 1 ? "#9ca3af" : theme.primaryColor,
              }}
            >
              <ChevronLeft size={18} />
            </button>

            {generatePageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className="w-10 h-10 rounded-xl text-sm font-bold transition-all border-2"
                  style={
                    page === p
                      ? {
                          backgroundColor: theme.primaryColor,
                          color: theme.buttonText,
                          borderColor: theme.primaryColor,
                        }
                      : {
                          borderColor: theme.borderColor,
                          color: theme.textColor,
                          backgroundColor: theme.cardBg,
                        }
                  }
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor:
                  page === totalPages ? "#e5e7eb" : theme.primaryColor,
                color: page === totalPages ? "#9ca3af" : theme.primaryColor,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <StoreFooter />
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
