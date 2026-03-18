"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, Truck, ArrowUpRight,
  Plus, Store,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/components/providers/StoreProvider";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: { firstName: string; lastName: string; email: string };
  summary: { total: number };
  status: string;
  payment: { status: string };
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: any }> = {
  pending:   { label: "Pending",   icon: Clock },
  confirmed: { label: "Confirmed", icon: CheckCircle },
  shipped:   { label: "Shipped",   icon: Truck },
  delivered: { label: "Delivered", icon: CheckCircle },
  cancelled: { label: "Cancelled", icon: XCircle },
};

const sparkData = [30, 45, 28, 60, 75, 55, 90, 70, 85, 95, 60, 80];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function VendorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const { store, themeColors: theme } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get("/vendor/orders"),
          api.get("/vendor/products?limit=1"),
        ]);
        const orderList: Order[] = ordersRes.data.orders || [];
        setOrders(orderList);
        setStats({
          totalOrders: ordersRes.data.total || orderList.length,
          pendingOrders: orderList.filter((o) => o.status === "pending").length,
          totalRevenue: orderList
            .filter((o) => o.payment.status === "paid")
            .reduce((s, o) => s + o.summary.total, 0),
          totalProducts: productsRes.data.total || 0,
        });
      } catch {
        setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Store Banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="h-3 w-full" style={{ backgroundColor: theme.primaryColor }} />
        <div
          className="p-6 flex items-center justify-between"
          style={{ backgroundColor: theme.secondaryColor, border: `1px solid ${theme.borderColor}` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm"
              style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
            >
              {store?.storeName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: theme.textColor }}>
                {store?.storeName}
              </h2>
              <a
                href="/"
                className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: theme.accentColor }}
              >
                Visit Store <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Good morning, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening in your store today.</p>
        </div>
        <Link
          href="/dashboard/products/create"
          className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
          style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, sub: "In your store" },
          { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, sub: `${stats?.pendingOrders ?? 0} pending` },
          { label: "Revenue", value: `$${stats?.totalRevenue ?? 0}`, icon: DollarSign, sub: "From paid orders" },
          { label: "Growth", value: "\u2014", icon: TrendingUp, sub: "Coming soon" },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.secondaryColor }}>
                <Icon size={22} style={{ color: theme.primaryColor }} />
              </div>
              <span className="text-xs text-gray-400 font-medium">{sub}</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Revenue Overview</h2>
            <p className="text-gray-400 text-sm mt-0.5">Last 12 months trend</p>
          </div>
          <span className="text-2xl font-black text-gray-900">${stats?.totalRevenue ?? 0}</span>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {sparkData.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md transition-all hover:opacity-80 cursor-pointer"
              style={{ height: `${v}%`, backgroundColor: theme.primaryColor }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {months.map((m) => (
            <span key={m} className="text-xs text-gray-400 flex-1 text-center">{m}</span>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Add Product", href: "/dashboard/products/create", icon: Plus },
          { label: "View Orders", href: "/dashboard/orders", icon: ShoppingCart },
          { label: "Store Settings", href: "/dashboard/settings", icon: Store },
          { label: "Visit Store", href: "/", icon: ArrowUpRight },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: theme.secondaryColor }}>
              <Icon size={20} style={{ color: theme.primaryColor }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: theme.primaryColor }}
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm">Orders from your customers will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Order", "Customer", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((o) => {
                  const s = statusConfig[o.status] || statusConfig.pending;
                  const Icon = s.icon;
                  return (
                    <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{o.orderNumber}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{o.customer.firstName} {o.customer.lastName}</p>
                        <p className="text-xs text-gray-400">{o.customer.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">${o.summary.total}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}
                        >
                          <Icon size={11} />{s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-24 bg-gray-100 rounded-2xl" />
      <div className="h-8 bg-gray-200 rounded-xl w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-32" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 h-48" />
      <div className="bg-white rounded-2xl border border-gray-100 h-64" />
    </div>
  );
}
