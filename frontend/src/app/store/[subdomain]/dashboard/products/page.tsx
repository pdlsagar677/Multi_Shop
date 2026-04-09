"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Package, CheckCircle, XCircle,
  MoreVertical, Edit, Trash2, Power,
  ChevronLeft, ChevronRight, Filter, Loader2,
  ImageIcon, Star, Percent, X, AlertTriangle,
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
  isFeatured: boolean;
  discountPercent: number;
  discountValidUntil: string | null;
  effectivePrice?: number;
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
  const [featureToggling, setFeatureToggling] = useState<string | null>(null);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [discountForm, setDiscountForm] = useState({ percent: "", validUntil: "" });
  const [discountSaving, setDiscountSaving] = useState(false);
  const [filterTab, setFilterTab]     = useState<"all" | "featured" | "onSale" | "lowStock">("all");
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockQty, setStockQty]       = useState("");
  const [stockSaving, setStockSaving] = useState(false);

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

  const handleFeatureToggle = async (product: Product) => {
    try {
      setFeatureToggling(product._id);
      const { data } = await api.patch(`/vendor/products/${product._id}/feature`);
      setProducts(prev =>
        prev.map(p => p._id === product._id ? { ...p, isFeatured: data.isFeatured } : p)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to toggle featured");
    } finally {
      setFeatureToggling(null);
    }
  };

  const handleDiscountSave = async () => {
    if (!discountProduct) return;
    try {
      setDiscountSaving(true);
      await api.put(`/vendor/products/${discountProduct._id}`, {
        discountPercent: Number(discountForm.percent) || 0,
        discountValidUntil: discountForm.validUntil || null,
      });
      setProducts(prev =>
        prev.map(p => p._id === discountProduct._id ? {
          ...p,
          discountPercent: Number(discountForm.percent) || 0,
          discountValidUntil: discountForm.validUntil || null,
        } : p)
      );
      setDiscountProduct(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscountSaving(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!discountProduct) return;
    try {
      setDiscountSaving(true);
      await api.put(`/vendor/products/${discountProduct._id}`, {
        discountPercent: 0,
        discountValidUntil: null,
      });
      setProducts(prev =>
        prev.map(p => p._id === discountProduct._id ? { ...p, discountPercent: 0, discountValidUntil: null } : p)
      );
      setDiscountProduct(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscountSaving(false);
    }
  };

  const handleAddStock = async (productId: string) => {
    const qty = parseInt(stockQty);
    if (!qty || qty < 1) return;
    try {
      setStockSaving(true);
      const { data } = await api.patch(`/vendor/products/${productId}/stock`, { quantity: qty });
      setProducts(prev =>
        prev.map(p => p._id === productId ? { ...p, stock: data.stock } : p)
      );
      setStockEditId(null);
      setStockQty("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add stock");
    } finally {
      setStockSaving(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    let matchTab = true;
    if (filterTab === "featured") matchTab = p.isFeatured;
    else if (filterTab === "onSale") matchTab = p.discountPercent > 0;
    else if (filterTab === "lowStock") matchTab = p.stock <= 5;
    return matchSearch && matchCategory && matchTab;
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

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "all" as const, label: "All", icon: null },
          { key: "featured" as const, label: "Featured", icon: Star },
          { key: "onSale" as const, label: "On Sale", icon: Percent },
          { key: "lowStock" as const, label: "Low Stock", icon: AlertTriangle },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setFilterTab(key); resetPage(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
            style={filterTab === key
              ? { backgroundColor: theme.primaryColor, color: theme.buttonText, borderColor: theme.primaryColor }
              : { borderColor: "#e5e7eb", color: "#6b7280" }
            }
          >
            {Icon && <Icon size={14} />}
            {label}
            {key === "featured" && <span className="text-xs opacity-70">({products.filter(p => p.isFeatured).length})</span>}
            {key === "onSale" && <span className="text-xs opacity-70">({products.filter(p => p.discountPercent > 0).length})</span>}
            {key === "lowStock" && <span className="text-xs opacity-70">({products.filter(p => p.stock <= 5).length})</span>}
          </button>
        ))}
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
                  {["Product", "Price", "Stock", "Featured", "Discount", "Category", "Status", ""].map(h => (
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
                      <p className="text-sm font-bold text-gray-900">Rs.{p.price}</p>
                      {p.discountPercent > 0 && (
                        <p className="text-xs text-green-600 font-semibold">
                          Rs.{(p.price * (1 - p.discountPercent / 100)).toFixed(2)}
                        </p>
                      )}
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <p className="text-xs text-gray-400 line-through">Rs.{p.compareAtPrice}</p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      {stockEditId === p._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={stockQty}
                            onChange={e => setStockQty(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAddStock(p._id)}
                            placeholder="Qty"
                            autoFocus
                            className="w-16 px-2 py-1.5 text-sm font-semibold text-gray-900 border-2 rounded-lg outline-none text-center"
                            style={{ borderColor: theme.primaryColor }}
                          />
                          <button
                            onClick={() => handleAddStock(p._id)}
                            disabled={stockSaving || !stockQty || parseInt(stockQty) < 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold disabled:opacity-40 transition-all"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            {stockSaving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                          </button>
                          <button
                            onClick={() => { setStockEditId(null); setStockQty(""); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${p.stock <= 0 ? "text-red-600" : p.stock <= 5 ? "text-yellow-600" : "text-gray-900"}`}>
                            {p.stock}
                          </span>
                          {p.stock <= 0 && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">OUT</span>
                          )}
                          {p.stock > 0 && p.stock <= 5 && (
                            <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">LOW</span>
                          )}
                          <button
                            onClick={() => { setStockEditId(p._id); setStockQty(""); }}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-500 transition-all opacity-0 group-hover:opacity-100"
                            title="Add stock"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Featured */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleFeatureToggle(p)}
                        disabled={featureToggling === p._id}
                        className="transition-all hover:scale-110 disabled:opacity-50"
                        title={p.isFeatured ? "Remove from featured" : "Mark as featured"}
                      >
                        {featureToggling === p._id ? (
                          <Loader2 size={18} className="animate-spin text-gray-400" />
                        ) : (
                          <Star
                            size={18}
                            className={p.isFeatured ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                          />
                        )}
                      </button>
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-4">
                      {p.discountPercent > 0 ? (
                        <button
                          onClick={() => { setDiscountProduct(p); setDiscountForm({ percent: String(p.discountPercent), validUntil: p.discountValidUntil ? p.discountValidUntil.slice(0, 16) : "" }); }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          <Percent size={12} /> {p.discountPercent}%
                        </button>
                      ) : (
                        <button
                          onClick={() => { setDiscountProduct(p); setDiscountForm({ percent: "", validUntil: "" }); }}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          + Set
                        </button>
                      )}
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

      {/* Discount Modal */}
      {discountProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Set Discount</h3>
              <button onClick={() => setDiscountProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Product: <span className="font-semibold text-gray-700">{discountProduct.name}</span>
              <br />
              Original Price: <span className="font-semibold">Rs.{discountProduct.price.toFixed(2)}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountForm.percent}
                    onChange={e => setDiscountForm(f => ({ ...f, percent: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
                {discountForm.percent && Number(discountForm.percent) > 0 && (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    Sale Price: Rs.{(discountProduct.price * (1 - Number(discountForm.percent) / 100)).toFixed(2)}
                    <span className="text-gray-400 ml-2 line-through">Rs.{discountProduct.price.toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Expires On (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={discountForm.validUntil}
                  onChange={e => setDiscountForm(f => ({ ...f, validUntil: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {discountProduct.discountPercent > 0 && (
                <button
                  onClick={handleRemoveDiscount}
                  disabled={discountSaving}
                  className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all disabled:opacity-60"
                >
                  Remove
                </button>
              )}
              <button
                onClick={handleDiscountSave}
                disabled={discountSaving || !discountForm.percent || Number(discountForm.percent) <= 0}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
              >
                {discountSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  "Apply Discount"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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