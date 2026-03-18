"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Package, CheckCircle, XCircle,
  MoreVertical, Edit, Trash2, Power,
  ChevronLeft, ChevronRight, Filter, Loader2,
  ImageIcon,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
}

const ITEMS_PER_PAGE = 8;

export default function VendorProductsPage() {
  const { themeColors: theme } = useStore();
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [page, setPage]               = useState(1);
  const [menuOpen, setMenuOpen]       = useState<string | null>(null);
  const [toggling, setToggling]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/vendor/products");
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (product: Product) => {
    try {
      setToggling(product._id);
      await api.patch(`/vendor/products/${product._id}/toggle`);
      setProducts(prev =>
        prev.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
      setMenuOpen(null);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      setDeleting(product._id);
      await api.delete(`/vendor/products/${product._id}`);
      setProducts(prev => prev.filter(p => p._id !== product._id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetPage = () => setPage(1);

  if (loading) return <ProductListSkeleton />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {products.length} total · {products.filter(p => p.isActive).length} active
          </p>
        </div>
        <Link href="/dashboard/products/create"
          className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md self-start sm:self-auto"
          style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
            style={{ ["--tw-ring-color" as string]: theme.primaryColor }}
            onFocus={e => e.target.style.borderColor = theme.primaryColor}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); resetPage(); }}
            className="pl-8 pr-8 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none bg-gray-50 appearance-none cursor-pointer"
            onFocus={e => e.target.style.borderColor = theme.primaryColor}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}>
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={44} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {search || filterCategory !== "all"
                ? "No products match your filters"
                : "No products yet"}
            </p>
            {!search && filterCategory === "all" && (
              <Link href="/dashboard/products/create"
                className="inline-flex items-center gap-2 mt-4 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                <Plus size={16} /> Create First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Product", "Price", "Stock", "Category", "Status", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">

                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.images && p.images.length > 0 ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <ImageIcon size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                          {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">${p.price}</p>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <p className="text-xs text-gray-400 line-through">${p.compareAtPrice}</p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${p.stock <= 0 ? "text-red-600" : p.stock <= 5 ? "text-yellow-600" : "text-gray-900"}`}>
                        {p.stock}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      {p.category ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}>
                          {p.category}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">&mdash;</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <CheckCircle size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                          <XCircle size={11} /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions - Fixed Dropdown */}
                    <td className="px-5 py-4 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === p._id ? null : p._id);
                        }}
                        className="dropdown-trigger w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {toggling === p._id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <MoreVertical size={16} />
                        }
                      </button>

                      {menuOpen === p._id && (
                        <div 
                          className="dropdown-menu absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/dashboard/products/${p._id}/edit`}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Edit size={14} /> Edit Product
                          </Link>
                          <button 
                            onClick={() => handleToggle(p)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Power size={14} />
                            {p.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button 
                            onClick={() => { 
                              setMenuOpen(null); 
                              setConfirmDelete(p); 
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={page !== 1 ? { borderColor: theme.primaryColor, color: theme.primaryColor } : {}}>
                <ChevronLeft size={15} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className="w-8 h-8 rounded-lg text-sm font-semibold transition-all border-2"
                  style={page === i + 1
                    ? { backgroundColor: theme.primaryColor, color: theme.buttonText, borderColor: theme.primaryColor }
                    : { borderColor: "#e5e7eb", color: "#6b7280" }
                  }>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={page !== totalPages ? { borderColor: theme.primaryColor, color: theme.primaryColor } : {}}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Delete Product</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">&quot;{confirmDelete.name}&quot;</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-all">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting === confirmDelete._id}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {deleting === confirmDelete._id
                  ? <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                  : <><Trash2 size={16} /> Delete</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-32 bg-gray-200 rounded-xl" />
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-16 bg-white rounded-2xl border border-gray-100" />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-32" />
              <div className="h-3 bg-gray-100 rounded-lg w-24" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}