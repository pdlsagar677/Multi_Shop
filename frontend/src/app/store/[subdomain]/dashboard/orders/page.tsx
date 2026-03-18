"use client";
import { useEffect, useState } from "react";
import {
  ShoppingCart, Clock, CheckCircle, Truck, XCircle,
  Search, ChevronLeft, ChevronRight, Loader2, Package,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

interface Order {
  _id: string;
  orderNumber: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  items: { name: string; quantity: number; price: number }[];
  summary: { total: number };
  status: string;
  payment: { status: string; method: string };
  createdAt: string;
}

const STATUS_TABS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,       color: "#f59e0b", bg: "#fef3c7" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
  shipped:   { label: "Shipped",   icon: Truck,       color: "#0ea5e9", bg: "#e0f2fe" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "#059669", bg: "#d1fae5" },
  cancelled: { label: "Cancelled", icon: XCircle,     color: "#ef4444", bg: "#fef2f2" },
};

const paymentBadge: Record<string, { color: string; bg: string }> = {
  pending:  { color: "#f59e0b", bg: "#fef3c7" },
  paid:     { color: "#10b981", bg: "#ecfdf5" },
  failed:   { color: "#ef4444", bg: "#fef2f2" },
  refunded: { color: "#6366f1", bg: "#eef2ff" },
};

// Valid next statuses for the dropdown
const nextStatuses: Record<string, string[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped:   ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export default function OrdersPage() {
  const { themeColors: theme } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [tab, page, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (tab !== "all") params.set("status", tab);
      if (search.trim()) params.set("search", search.trim());

      const { data } = await api.get(`/vendor/orders?${params.toString()}`);
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.patch(`/vendor/orders/${orderId}/status`, { status: newStatus });
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total} total order{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl flex-1 overflow-x-auto"
          style={{ backgroundColor: theme.secondaryColor }}
        >
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setTab(s); setPage(1); }}
              className="px-3 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all"
              style={
                tab === s
                  ? { backgroundColor: theme.cardBg, color: theme.textColor, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                  : { color: theme.accentColor }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
            style={{
              backgroundColor: theme.secondaryColor,
              color: theme.textColor,
              border: `1px solid ${theme.borderColor}`,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin" style={{ color: theme.primaryColor }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {tab !== "all" || search
                ? "Try adjusting your filters"
                : "Orders from your customers will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  const pb = paymentBadge[order.payment.status] || paymentBadge.pending;
                  const available = nextStatuses[order.status] || [];

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{order.customer.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {order.items.slice(0, 2).map((item, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded font-medium"
                              style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}
                            >
                              {item.name} x{item.quantity}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">
                        Rs.{order.summary.total.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-md capitalize"
                          style={{ backgroundColor: pb.bg, color: pb.color }}
                        >
                          {order.payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={{ backgroundColor: sc.bg, color: sc.color }}
                        >
                          <StatusIcon size={12} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        {available.length > 0 ? (
                          <select
                            value=""
                            disabled={updatingId === order._id}
                            onChange={(e) => {
                              if (e.target.value) handleStatusChange(order._id, e.target.value);
                            }}
                            className="text-xs font-semibold border rounded-lg px-2 py-1.5 outline-none cursor-pointer disabled:opacity-50"
                            style={{ borderColor: theme.borderColor, color: theme.textColor }}
                          >
                            <option value="">Update...</option>
                            {available.map((s) => (
                              <option key={s} value={s}>
                                {s === "cancelled" ? "Cancel" : statusConfig[s]?.label || s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
