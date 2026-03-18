"use client";
import { useEffect, useState } from "react";
import {
  Users, Search, MoreVertical, Edit, Trash2, Power,
  ChevronLeft, ChevronRight, Loader2, Mail, Phone,
  ShoppingCart, DollarSign, X, AlertCircle, CheckCircle, XCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function VendorCustomersPage() {
  const { themeColors: theme } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if clicking outside the dropdown menu
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const { data } = await api.get("/vendor/customers", { params });
      setCustomers(data.customers || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    try {
      setToggling(customer._id);
      await api.put(`/vendor/customers/${customer._id}`, {
        isActive: !customer.isActive,
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, isActive: !c.isActive } : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
      setMenuOpen(null);
    }
  };

  const handleDelete = async (customer: Customer) => {
    try {
      setDeleting(customer._id);
      await api.delete(`/vendor/customers/${customer._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      setTotal((prev) => prev - 1);
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({ name: customer.name, phone: customer.phone || "" });
    setEditError(null);
    setMenuOpen(null);
  };

  const handleEditSave = async () => {
    if (!editingCustomer) return;
    if (!editForm.name.trim()) {
      setEditError("Name is required.");
      return;
    }
    try {
      setEditSaving(true);
      setEditError(null);
      const { data } = await api.put(
        `/vendor/customers/${editingCustomer._id}`,
        {
          name: editForm.name.trim(),
          phone: editForm.phone.trim() || null,
        }
      );
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === editingCustomer._id
            ? { ...c, name: data.customer.name, phone: data.customer.phone }
            : c
        )
      );
      setEditingCustomer(null);
    } catch (err: any) {
      setEditError(
        err.response?.data?.message || "Failed to update customer."
      );
    } finally {
      setEditSaving(false);
    }
  };

  const resetPage = () => setPage(1);

  if (loading && customers.length === 0) return <CustomerListSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {total} total customers
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
            onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        <div className="flex gap-2">
          {["all", "active", "inactive"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                resetPage();
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize"
              style={
                statusFilter === s
                  ? {
                      backgroundColor: theme.primaryColor,
                      color: theme.buttonText,
                      borderColor: theme.primaryColor,
                    }
                  : { borderColor: "#e5e7eb", color: "#6b7280" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={44} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {search || statusFilter !== "all"
                ? "No customers match your filters"
                : "No customers yet"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Customers will appear here when they register on your store.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Customer",
                    "Contact",
                    "Orders",
                    "Total Spent",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                          style={{
                            backgroundColor: theme.secondaryColor,
                            color: theme.accentColor,
                          }}
                        >
                          {c.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined{" "}
                            {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Mail size={12} className="text-gray-400" />
                          {c.email}
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone size={12} className="text-gray-400" />
                            {c.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <ShoppingCart size={13} className="text-gray-400" />
                        {c.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                        <DollarSign size={13} className="text-gray-400" />
                        {c.totalSpent.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {c.isActive ? (
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
                          setMenuOpen(menuOpen === c._id ? null : c._id);
                        }}
                        className="dropdown-trigger w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {toggling === c._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MoreVertical size={16} />
                        )}
                      </button>

                      {menuOpen === c._id && (
                        <div 
                          className="dropdown-menu absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openEdit(c)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit size={14} /> Edit Customer
                          </button>
                          <button
                            onClick={() => handleToggleActive(c)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Power size={14} />
                            {c.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              setConfirmDelete(c);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
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
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}&ndash;
              {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={
                  page !== 1
                    ? {
                        borderColor: theme.primaryColor,
                        color: theme.primaryColor,
                      }
                    : {}
                }
              >
                <ChevronLeft size={15} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="w-8 h-8 rounded-lg text-sm font-semibold transition-all border-2"
                  style={
                    page === i + 1
                      ? {
                          backgroundColor: theme.primaryColor,
                          color: theme.buttonText,
                          borderColor: theme.primaryColor,
                        }
                      : { borderColor: "#e5e7eb", color: "#6b7280" }
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={
                  page !== totalPages
                    ? {
                        borderColor: theme.primaryColor,
                        color: theme.primaryColor,
                      }
                    : {}
                }
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">
                Edit Customer
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle
                  size={16}
                  className="text-red-500 mt-0.5 shrink-0"
                />
                <p className="text-red-700 text-sm">{editError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                  onFocus={(e) =>
                    (e.target.style.borderColor = theme.primaryColor)
                  }
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email cannot be changed.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+977 98XXXXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                  onFocus={(e) =>
                    (e.target.style.borderColor = theme.primaryColor)
                  }
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingCustomer(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonText,
                }}
              >
                {editSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
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
            <h3 className="text-lg font-black text-gray-900 mb-1">
              Delete Customer
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                &quot;{confirmDelete.name}&quot;
              </span>
              ? This will remove their account and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting === confirmDelete._id}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {deleting === confirmDelete._id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Delete
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

function CustomerListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-16 bg-white rounded-2xl border border-gray-100" />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-32" />
              <div className="h-3 bg-gray-100 rounded-lg w-48" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}