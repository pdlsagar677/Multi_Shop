"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Store, CheckCircle, XCircle,
  MoreVertical, ExternalLink, Trash2, Power,
  ChevronLeft, ChevronRight, Filter, Loader2,
  Mail, Phone, Calendar, Sparkles, Shield,
  Eye, Download, RefreshCw, Grid, List,
} from "lucide-react";
import api from "@/lib/axios";

interface Vendor {
  _id: string;
  storeName: string;
  subdomain: string;
  isActive: boolean;
  subscription: { plan: string; status: string };
  branding: { primaryColor: string };
  ownerId: {
    name: string;
    email: string;
    phone: string | null;
    lastLogin: string | null;
    isActive: boolean;
  };
  createdAt: string;
}

const ITEMS_PER_PAGE = 8;

const planColors: Record<string, { bg: string; text: string; badge: string }> = {
  basic: { 
    bg: "bg-gradient-to-r from-gray-100 to-gray-200", 
    text: "text-gray-700",
    badge: "bg-gray-500"
  },
  pro: { 
    bg: "bg-gradient-to-r from-blue-50 to-blue-100", 
    text: "text-blue-700",
    badge: "bg-blue-500"
  },
  premium: { 
    bg: "bg-gradient-to-r from-purple-50 to-purple-100", 
    text: "text-purple-700",
    badge: "bg-purple-500"
  },
};

export default function VendorsListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  // Close dropdown when clicking outside
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

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/vendors");
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVendors();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggle = async (vendor: Vendor) => {
    try {
      setToggling(vendor._id);
      const { data } = await api.patch(`/admin/vendors/${vendor._id}/toggle`);
      setVendors(prev =>
        prev.map(v => v._id === vendor._id ? { ...v, isActive: data.isActive } : v)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
      setMenuOpen(null);
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      setDeleting(vendor._id);
      await api.delete(`/admin/vendors/${vendor._id}`);
      setVendors(prev => prev.filter(v => v._id !== vendor._id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  // ── Filter + Search ──
  const filtered = vendors.filter(v => {
    const matchSearch =
      v.storeName.toLowerCase().includes(search.toLowerCase()) ||
      v.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || v.subscription.plan === filterPlan;
    const matchStatus = filterStatus === "all"
      || (filterStatus === "active" && v.isActive)
      || (filterStatus === "inactive" && !v.isActive);
    return matchSearch && matchPlan && matchStatus;
  });

  // ── Pagination ──
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetPage = () => setPage(1);

  if (loading) return <VendorListSkeleton />;

  return (
    <div className="space-y-8">
      {/* ── Header with Stats Cards ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Store size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Vendors</h1>
            <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full">
              <span className="text-xs font-bold text-white">{vendors.length} Total</span>
            </div>
          </div>
          <p className="text-gray-500 flex items-center gap-2 ml-2">
            <Sparkles size={14} className="text-amber-400" />
            Manage all vendor stores from one central dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-3 bg-white border-2 border-gray-200 rounded-xl text-gray-500 hover:text-orange-500 hover:border-orange-400 transition-all"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-md text-orange-500" : "text-gray-400"}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-md text-orange-500" : "text-gray-400"}`}
            >
              <Grid size={18} />
            </button>
          </div>
          <Link
            href="/admin/vendors/create"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105"
          >
            <Plus size={18} />
            Add Vendor
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: vendors.length, icon: Store, color: "from-amber-400 to-orange-500", change: "+12%" },
          { label: "Active Stores", value: vendors.filter(v => v.isActive).length, icon: CheckCircle, color: "from-green-400 to-emerald-500", change: "+5%" },
          { label: "Premium Plans", value: vendors.filter(v => v.subscription.plan === "premium").length, icon: Shield, color: "from-purple-400 to-purple-500", change: "+8%" },
          { label: "New This Month", value: vendors.filter(v => new Date(v.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: Sparkles, color: "from-blue-400 to-blue-500", change: "+23%" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon size={22} className="text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Enhanced Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by store, subdomain, owner, or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Plan filter */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); resetPage(); }}
                className="pl-8 pr-8 py-3.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-orange-400 bg-gray-50 appearance-none cursor-pointer min-w-[140px]">
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); resetPage(); }}
                className="pl-8 pr-8 py-3.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-orange-400 bg-gray-50 appearance-none cursor-pointer min-w-[140px]">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Export button */}
            <button className="px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all flex items-center gap-2">
              <Download size={16} />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(search || filterPlan !== "all" || filterStatus !== "all") && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Active filters:</span>
            {search && (
              <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1">
                Search: "{search}"
                <button onClick={() => setSearch("")} className="ml-1 hover:text-orange-800">×</button>
              </span>
            )}
            {filterPlan !== "all" && (
              <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1">
                Plan: {filterPlan}
                <button onClick={() => setFilterPlan("all")} className="ml-1 hover:text-orange-800">×</button>
              </span>
            )}
            {filterStatus !== "all" && (
              <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus("all")} className="ml-1 hover:text-orange-800">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table with Enhanced Design ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store size={32} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-6">
              {search || filterPlan !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first vendor store"}
            </p>
            {!search && filterPlan === "all" && filterStatus === "all" && (
              <Link href="/admin/vendors/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-200">
                <Plus size={18} />
                Create First Vendor
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  {["Store", "Owner", "URL", "Plan", "Status", "Created", ""].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((v, index) => (
                  <tr 
                    key={v._id} 
                    className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Store */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div
                            className="relative w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
                            style={{ backgroundColor: v.branding?.primaryColor || "#4F46E5" }}
                          >
                            {v.storeName[0].toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{v.storeName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            {v.subdomain}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-5">
                      <p className="font-semibold text-gray-900 text-sm">{v.ownerId?.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{v.ownerId?.email}</p>
                      </div>
                      {v.ownerId?.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{v.ownerId.phone}</p>
                        </div>
                      )}
                    </td>

                    {/* URL */}
                    <td className="px-6 py-5">
                      <a
                        href={`http://${v.subdomain}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-orange-600 hover:text-orange-700 font-medium group/link border border-gray-200 hover:border-orange-300 transition-all"
                      >
                        {v.subdomain}.localhost:3000
                        <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${planColors[v.subscription.plan].bg} ${planColors[v.subscription.plan].text}`}>
                        <div className={`w-2 h-2 rounded-full ${planColors[v.subscription.plan].badge}`} />
                        {v.subscription.plan}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      {v.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold border border-green-200">
                          <CheckCircle size={11} className="text-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-rose-50 text-red-700 text-xs font-semibold border border-red-200">
                          <XCircle size={11} className="text-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar size={11} className="text-gray-400" />
                        {new Date(v.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {v.ownerId?.lastLogin && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Eye size={10} />
                          Last login: {new Date(v.ownerId.lastLogin).toLocaleDateString()}
                        </p>
                      )}
                    </td>

                    {/* Actions - Enhanced Dropdown */}
                    <td className="px-6 py-5 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === v._id ? null : v._id);
                        }}
                        className="dropdown-trigger w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 transition-all opacity-0 group-hover:opacity-100 border-2 border-transparent hover:border-white/20"
                      >
                        {toggling === v._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MoreVertical size={16} />
                        )}
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpen === v._id && (
                        <div 
                          className="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-4 py-2 border-b border-gray-100 mb-1">
                            <p className="text-xs font-medium text-gray-400">Quick Actions</p>
                          </div>
                          
                          <Link href={`/admin/vendors/${v._id}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all group">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                              <Eye size={14} className="text-gray-600 group-hover:text-orange-500" />
                            </div>
                            <span className="flex-1">View Details</span>
                            <span className="text-xs text-gray-400">→</span>
                          </Link>

                          <a href={`http://${v.subdomain}.localhost:3000`} target="_blank"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all group">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                              <ExternalLink size={14} className="text-gray-600 group-hover:text-orange-500" />
                            </div>
                            <span className="flex-1">Visit Store</span>
                          </a>

                          <button 
                            onClick={() => handleToggle(v)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all group">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                              <Power size={14} className="text-gray-600 group-hover:text-orange-500" />
                            </div>
                            <span className="flex-1">{v.isActive ? "Deactivate" : "Activate"}</span>
                          </button>

                          <div className="border-t border-gray-100 my-2" />

                          <button 
                            onClick={() => { 
                              setMenuOpen(null); 
                              setConfirmDelete(v); 
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all group">
                            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                              <Trash2 size={14} className="text-red-500" />
                            </div>
                            <span className="flex-1">Delete Vendor</span>
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

        {/* ── Enhanced Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500 order-2 sm:order-1 mt-4 sm:mt-0">
              Showing <span className="font-semibold text-gray-900">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-semibold text-gray-900">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of{' '}
              <span className="font-semibold text-gray-900">{filtered.length}</span> vendors
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page, first, last, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button 
                        key={i} 
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all
                          ${page === pageNum
                            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-2 border-transparent shadow-lg shadow-orange-200"
                            : "border-2 border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === page - 2 ||
                    pageNum === page + 2
                  ) {
                    return <span key={i} className="text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Enhanced Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform animate-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={28} className="text-red-500" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Delete Vendor</h3>
            <p className="text-gray-500 text-center mb-8">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                {confirmDelete.storeName}
              </span>
              ? This will permanently remove the vendor and all associated data.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <span>This action cannot be undone. All products, orders, and customer data will be lost.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting === confirmDelete._id}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-red-200"
              >
                {deleting === confirmDelete._id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VendorListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 w-48 bg-gray-200 rounded-xl" />
        <div className="h-12 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-20 bg-gray-200 rounded-2xl" />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-32" />
              <div className="h-3 bg-gray-100 rounded-lg w-48" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}