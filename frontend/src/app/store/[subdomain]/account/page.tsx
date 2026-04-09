"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Phone, Calendar, ShoppingBag, LogOut,
  ChevronRight, Package, Clock, CheckCircle, Truck,
  XCircle, Loader2, Edit3, ShieldCheck, Save, X,
  Trash2, AlertTriangle, Eye, EyeOff, MapPin, Plus,
  Home, Briefcase, MoreHorizontal,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore, Address } from "@/store/addressStore";
import { useStore } from "@/components/providers/StoreProvider";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  summary: { total: number };
  status: string;
  payment: { status: string };
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,       color: "#f59e0b", bg: "#fef3c7" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
  shipped:   { label: "Shipped",   icon: Truck,       color: "#0ea5e9", bg: "#e0f2fe" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Cancelled", icon: XCircle,     color: "#ef4444", bg: "#fef2f2" },
};

type Tab = "profile" | "orders" | "addresses";

export default function AccountPage() {
  const router = useRouter();
  const { store, themeColors: theme, loading: storeLoading } = useStore();
  const { user, isAuthenticated, isLoading: authLoading, clearAuth } = useAuthStore();

  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch profile
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProfile();
  }, [isAuthenticated]);

  // Fetch orders when tab switches
  useEffect(() => {
    if (tab === "orders" && orders.length === 0 && isAuthenticated) {
      fetchOrders();
    }
  }, [tab, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data } = await api.get("/auth/me");
      setProfile(data.user);
    } catch {
      // silent — user might be logged out
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      // Orders endpoint might not exist yet - gracefully handle
      const { data } = await api.get("/customer/orders");
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    router.push("/login");
  };

  if (storeLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: theme.primaryColor }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-sm"
            style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black truncate" style={{ color: theme.textColor }}>
              {user.name}
            </h1>
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shrink-0"
            style={{ borderColor: theme.borderColor }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-8"
          style={{ backgroundColor: theme.secondaryColor }}
        >
          {(
            [
              { key: "profile", label: "My Profile", icon: User },
              { key: "orders", label: "My Orders", icon: ShoppingBag },
              { key: "addresses", label: "Addresses", icon: MapPin },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all"
              style={
                tab === key
                  ? {
                      backgroundColor: theme.cardBg,
                      color: theme.textColor,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }
                  : { color: theme.accentColor }
              }
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "profile" ? (
          <ProfileTab
            profile={profile}
            loading={loadingProfile}
            theme={theme}
            user={user}
            onProfileUpdate={(updated: UserProfile) => setProfile(updated)}
            onAccountDeleted={() => { clearAuth(); router.push("/login"); }}
          />
        ) : tab === "orders" ? (
          <OrdersTab
            orders={orders}
            loading={loadingOrders}
            theme={theme}
            onOrderCancelled={(orderId: string) => {
              setOrders((prev) =>
                prev.map((o) => o._id === orderId ? { ...o, status: "cancelled" } : o)
              );
            }}
          />
        ) : (
          <AddressesTab theme={theme} />
        )}

        {/* Mobile logout */}
        <button
          onClick={handleLogout}
          className="sm:hidden w-full mt-8 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold text-red-500 border-red-200 bg-red-50 transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
      </main>

      <StoreFooter />
    </div>
  );
}

/* ─── Profile Tab ─── */

function ProfileTab({
  profile,
  loading,
  theme,
  user,
  onProfileUpdate,
  onAccountDeleted,
}: {
  profile: UserProfile | null;
  loading: boolean;
  theme: any;
  user: any;
  onProfileUpdate: (updated: UserProfile) => void;
  onAccountDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", age: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const startEditing = () => {
    const data = profile || user;
    setEditForm({
      name: data.name || "",
      phone: data.phone || "",
      age: data.age ? String(data.age) : "",
    });
    setEditError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError("");
  };

  const handleSave = async () => {
    if (!editForm.name || editForm.name.trim().length < 2) {
      setEditError("Name must be at least 2 characters");
      return;
    }
    try {
      setSaving(true);
      setEditError("");
      const payload: any = { name: editForm.name.trim() };
      if (editForm.phone) payload.phone = editForm.phone.trim();
      else payload.phone = "";
      if (editForm.age) payload.age = parseInt(editForm.age, 10);
      else payload.age = "";
      const { data } = await api.put("/auth/profile", payload);
      onProfileUpdate(data.user);
      setEditing(false);
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }
    try {
      setDeleting(true);
      setDeleteError("");
      await api.delete("/auth/account", { data: { password: deletePassword } });
      onAccountDeleted();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl animate-pulse"
            style={{ backgroundColor: theme.secondaryColor }}
          />
        ))}
      </div>
    );
  }

  const data = profile || user;

  return (
    <div className="space-y-4">
      {/* Info card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{ borderColor: theme.borderColor }}
        >
          <h2 className="font-black" style={{ color: theme.textColor }}>
            Personal Information
          </h2>
          {!editing ? (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: theme.primaryColor, backgroundColor: theme.secondaryColor }}
            >
              <Edit3 size={14} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </div>
          )}
        </div>

        {editError && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
            {editError}
          </div>
        )}

        <div className="divide-y" style={{ borderColor: theme.borderColor }}>
          {/* Full Name */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <User size={18} style={{ color: theme.primaryColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
              {editing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-sm font-semibold mt-1 px-3 py-2 rounded-xl border-2 outline-none transition-colors"
                  style={{ borderColor: theme.borderColor, color: theme.textColor }}
                  onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = theme.borderColor)}
                />
              ) : (
                <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: theme.textColor }}>
                  {data.name}
                </p>
              )}
            </div>
          </div>

          {/* Email (always read-only) */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <Mail size={18} style={{ color: theme.primaryColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: theme.textColor }}>
                {data.email}
              </p>
            </div>
            {profile?.isVerified ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
                <ShieldCheck size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0" style={{ backgroundColor: "#fef3c7", color: "#f59e0b" }}>
                Unverified
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <Phone size={18} style={{ color: theme.primaryColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
              {editing ? (
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. +977 9800000000"
                  className="w-full text-sm font-semibold mt-1 px-3 py-2 rounded-xl border-2 outline-none transition-colors"
                  style={{ borderColor: theme.borderColor, color: theme.textColor }}
                  onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = theme.borderColor)}
                />
              ) : (
                <p className={`text-sm font-semibold mt-0.5 truncate ${!data.phone ? "text-gray-400 italic" : ""}`} style={data.phone ? { color: theme.textColor } : undefined}>
                  {data.phone || "Not provided"}
                </p>
              )}
            </div>
          </div>

          {/* Age */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <Calendar size={18} style={{ color: theme.primaryColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Age</p>
              {editing ? (
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  placeholder="e.g. 25"
                  min={13}
                  max={120}
                  className="w-full text-sm font-semibold mt-1 px-3 py-2 rounded-xl border-2 outline-none transition-colors"
                  style={{ borderColor: theme.borderColor, color: theme.textColor }}
                  onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = theme.borderColor)}
                />
              ) : (
                <p className={`text-sm font-semibold mt-0.5 truncate ${!data.age ? "text-gray-400 italic" : ""}`} style={data.age ? { color: theme.textColor } : undefined}>
                  {data.age || "Not provided"}
                </p>
              )}
            </div>
          </div>

          {/* Member Since (always read-only) */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <Clock size={18} style={{ color: theme.primaryColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Member Since</p>
              <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: theme.textColor }}>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account security */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
      >
        <h2 className="font-black mb-4" style={{ color: theme.textColor }}>
          Account Security
        </h2>
        <Link
          href="/change-password"
          className="flex items-center justify-between py-3 group"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <ShieldCheck size={18} style={{ color: theme.primaryColor }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: theme.textColor }}>
                Change Password
              </p>
              <p className="text-xs text-gray-400">Update your account password</p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-gray-400 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Danger Zone */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: theme.cardBg, border: "1px solid #fecaca" }}
      >
        <h2 className="font-black mb-2 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>
        <button
          onClick={() => { setShowDeleteModal(true); setDeletePassword(""); setDeleteError(""); setShowPassword(false); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 border-2 border-red-200 hover:bg-red-50 transition-all"
        >
          <Trash2 size={16} /> Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: theme.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-lg" style={{ color: theme.textColor }}>Delete Account</h3>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              All your personal data, order history, and account information will be permanently deleted. Please enter your password to confirm.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium mb-4">
                {deleteError}
              </div>
            )}

            <div className="relative mb-5">
              <input
                type={showPassword ? "text" : "password"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 text-sm font-medium outline-none transition-colors"
                style={{ borderColor: theme.borderColor, color: theme.textColor }}
                onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
                onBlur={(e) => (e.target.style.borderColor = theme.borderColor)}
                onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: theme.borderColor, color: theme.textColor }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Orders Tab ─── */

function OrdersTab({
  orders,
  loading,
  theme,
  onOrderCancelled,
}: {
  orders: Order[];
  loading: boolean;
  theme: any;
  onOrderCancelled: (orderId: string) => void;
}) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      setCancelError("");
      await api.delete(`/orders/${orderId}`);
      onOrderCancelled(orderId);
      setConfirmCancelId(null);
    } catch (err: any) {
      setCancelError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl animate-pulse"
            style={{ backgroundColor: theme.secondaryColor }}
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        className="rounded-2xl p-16 text-center"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
      >
        <ShoppingBag size={56} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-black text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          When you place your first order, it will appear here so you can track its progress.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
        >
          <Package size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const sc = statusConfig[order.status] || statusConfig.pending;
        const StatusIcon = sc.icon;
        const isPending = order.status === "pending";
        return (
          <div
            key={order._id}
            className="rounded-2xl p-5 sm:p-6 transition-all hover:shadow-sm"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-black" style={{ color: theme.textColor }}>
                  Order #{order.orderNumber}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: sc.bg, color: sc.color }}
                >
                  <StatusIcon size={12} />
                  {sc.label}
                </span>
                <span className="text-lg font-black" style={{ color: theme.textColor }}>
                  ${order.summary.total.toFixed(2)}
                </span>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div
                className="border-t pt-3 flex flex-wrap gap-2"
                style={{ borderColor: theme.borderColor }}
              >
                {order.items.slice(0, 3).map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md font-medium"
                    style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}
                  >
                    {item.name} x{item.quantity}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs text-gray-400 py-1">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Cancel button for pending orders */}
            {isPending && (
              <div className="border-t mt-3 pt-3" style={{ borderColor: theme.borderColor }}>
                {confirmCancelId === order._id ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-red-500 font-medium">Cancel this order?</p>
                    {cancelError && confirmCancelId === order._id && (
                      <p className="text-xs text-red-500 w-full">{cancelError}</p>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => { setConfirmCancelId(null); setCancelError(""); }}
                        disabled={cancellingId === order._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all hover:bg-gray-50"
                        style={{ borderColor: theme.borderColor, color: theme.textColor }}
                      >
                        No, Keep It
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {cancellingId === order._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setConfirmCancelId(order._id); setCancelError(""); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    <XCircle size={14} /> Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Addresses Tab */

function AddressesTab({ theme }: { theme: any }) {
  const { addresses, loading, fetchAddresses, addAddress, updateAddress, deleteAddress } = useAddressStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ street: string; city: string; state: string; zipCode: string; phone: string; label: "home" | "work" | "other"; country: string }>({ street: "", city: "", state: "", zipCode: "", phone: "", label: "home", country: "Nepal" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const labelIcons: Record<string, any> = { home: Home, work: Briefcase, other: MoreHorizontal };

  const resetForm = () => {
    setForm({ street: "", city: "", state: "", zipCode: "", phone: "", label: "home", country: "Nepal" });
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const startEdit = (addr: Address) => {
    setForm({
      street: addr.street,
      city: addr.city,
      state: addr.state || "",
      zipCode: addr.zipCode || "",
      phone: addr.phone,
      label: addr.label,
      country: addr.country || "Nepal",
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.street.trim() || !form.city.trim() || !form.phone.trim()) {
      setError("Street, city, and phone are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await addAddress(form);
      }
      resetForm();
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: theme.secondaryColor }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Address Cards */}
      {addresses.map((addr) => {
        const LabelIcon = labelIcons[addr.label] || MapPin;
        return (
          <div
            key={addr._id}
            className="rounded-2xl p-5"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${addr.isDefault ? theme.primaryColor : theme.borderColor}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <LabelIcon size={18} style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}>
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: theme.textColor }}>{addr.street}</p>
                  <p className="text-xs text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zipCode || ""}</p>
                  <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(addr)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add / Edit Form */}
      {showForm ? (
        <div className="rounded-2xl p-5" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}>
          <h3 className="font-bold mb-4" style={{ color: theme.textColor }}>
            {editingId ? "Edit Address" : "Add New Address"}
          </h3>
          {error && <p className="text-sm text-red-500 font-medium mb-3">{error}</p>}
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["home", "work", "other"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, label: l })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize border-2 transition-all"
                  style={form.label === l
                    ? { borderColor: theme.primaryColor, backgroundColor: theme.secondaryColor, color: theme.accentColor }
                    : { borderColor: "#e5e7eb", color: "#6b7280" }
                  }
                >
                  {l}
                </button>
              ))}
            </div>
            <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="Street address *" className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 outline-none transition-colors text-gray-900 bg-white placeholder-gray-400" style={{ borderColor: theme.borderColor }} onFocus={e => e.target.style.borderColor = theme.primaryColor} onBlur={e => e.target.style.borderColor = theme.borderColor} />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City *" className="px-4 py-3 rounded-xl text-sm font-medium border-2 outline-none transition-colors text-gray-900 bg-white placeholder-gray-400" style={{ borderColor: theme.borderColor }} onFocus={e => e.target.style.borderColor = theme.primaryColor} onBlur={e => e.target.style.borderColor = theme.borderColor} />
              <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="State" className="px-4 py-3 rounded-xl text-sm font-medium border-2 outline-none transition-colors text-gray-900 bg-white placeholder-gray-400" style={{ borderColor: theme.borderColor }} onFocus={e => e.target.style.borderColor = theme.primaryColor} onBlur={e => e.target.style.borderColor = theme.borderColor} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} placeholder="Zip Code" className="px-4 py-3 rounded-xl text-sm font-medium border-2 outline-none transition-colors text-gray-900 bg-white placeholder-gray-400" style={{ borderColor: theme.borderColor }} onFocus={e => e.target.style.borderColor = theme.primaryColor} onBlur={e => e.target.style.borderColor = theme.borderColor} />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone *" className="px-4 py-3 rounded-xl text-sm font-medium border-2 outline-none transition-colors text-gray-900 bg-white placeholder-gray-400" style={{ borderColor: theme.borderColor }} onFocus={e => e.target.style.borderColor = theme.primaryColor} onBlur={e => e.target.style.borderColor = theme.borderColor} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={resetForm} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all" style={{ borderColor: theme.borderColor, color: theme.textColor }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60" style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        addresses.length < 3 && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ borderColor: theme.borderColor, color: theme.accentColor }}
          >
            <Plus size={18} /> Add New Address
          </button>
        )
      )}

      {addresses.length >= 3 && !showForm && (
        <p className="text-xs text-center text-gray-400 font-medium">
          Maximum 3 addresses allowed per store
        </p>
      )}
    </div>
  );
}
