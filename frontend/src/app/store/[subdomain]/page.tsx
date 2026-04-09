"use client";
import { useEffect, useState } from "react";
import {
  Search, ChevronLeft, ChevronRight,
  Package, X,
} from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { getTemplate } from "@/components/store/templates";
import CategoryChips from "@/components/store/CategoryChips";
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
  discountPercent?: number;
  isFeatured?: boolean;
  effectivePrice?: number;
}

const LIMIT = 12;

export default function StorePage() {
  const { store, themeColors: theme, template, loading: storeLoading, error: storeError } = useStore();
  const {
    HeroSection,
    NavbarLayout,
    FooterLayout,
    ProductCard,
    FeaturedSection,
    SaleSection,
  } = getTemplate(template);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("newest");
  const [inStock, setInStock] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories from dedicated endpoint
  useEffect(() => {
    if (!store) return;
    api.get(`/store/${store.subdomain}/categories`)
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, [store]);

  // Fetch products
  useEffect(() => {
    if (!store) return;
    fetchProducts();
  }, [store, debouncedSearch, category, page, sort, inStock]);

  const fetchProducts = async () => {
    if (!store) return;
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
        sort,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== "all") params.category = category;
      if (inStock) params.inStock = "true";

      const { data } = await api.get(`/store/${store.subdomain}/products`, { params });
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = debouncedSearch || category !== "all" || sort !== "newest" || inStock;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setInStock(false);
    setPage(1);
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
      <NavbarLayout />

      {/* Hero */}
      <HeroSection />

      {/* Category Chips */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
          <CategoryChips
            categories={categories}
            selected={category}
            onSelect={(c) => { setCategory(c); setPage(1); }}
            theme={theme}
          />
        </section>
      )}

      {/* Featured Products */}
      <FeaturedSection subdomain={store.subdomain} theme={theme} />

      {/* Sale Products */}
      <SaleSection subdomain={store.subdomain} theme={theme} />

      {/* All Products Section */}
      <section id="all-products" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1">

        <h2 className="text-xl sm:text-2xl font-black mb-6" style={{ color: theme.textColor }}>
          All Products
        </h2>

        {/* Search + Sort + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-3 border-2 rounded-xl text-sm text-gray-700 focus:outline-none bg-white appearance-none cursor-pointer min-w-[160px]"
            style={{ borderColor: theme.borderColor }}
            onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = theme.borderColor)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          {/* In Stock Toggle */}
          <button
            onClick={() => { setInStock(!inStock); setPage(1); }}
            className="px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              borderColor: inStock ? theme.primaryColor : theme.borderColor,
              backgroundColor: inStock ? theme.secondaryColor : "white",
              color: inStock ? theme.accentColor : "#6b7280",
            }}
          >
            In Stock Only
          </button>
        </div>

        {/* Results info */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {total === 0
                ? "No products found"
                : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total} products`}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
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
                <div className="aspect-square" style={{ backgroundColor: theme.secondaryColor }} />
                <div className="p-4 space-y-3">
                  <div className="h-3 rounded-lg w-1/3" style={{ backgroundColor: theme.borderColor }} />
                  <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: theme.borderColor }} />
                  <div className="h-5 rounded-lg w-1/2" style={{ backgroundColor: theme.secondaryColor }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={56} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">
              {hasFilters ? "No products match your search" : "No products available yet"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {hasFilters ? "Try adjusting your filters" : "Check back soon for new arrivals!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} theme={theme} />
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
                borderColor: page === totalPages ? "#e5e7eb" : theme.primaryColor,
                color: page === totalPages ? "#9ca3af" : theme.primaryColor,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <FooterLayout />
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
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
