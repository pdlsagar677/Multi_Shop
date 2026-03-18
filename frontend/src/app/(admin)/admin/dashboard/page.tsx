"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store, Users, DollarSign, TrendingUp,
  Plus, CheckCircle, XCircle, Clock,
  ArrowUpRight, Sparkles, Shield, Calendar,
} from "lucide-react";
import api from "@/lib/axios";

interface Stats {
  totalVendors: number;
  totalCustomers: number;
  totalRevenue: number;
  activeVendors: number;
}

interface Vendor {
  _id: string;
  storeName: string;
  subdomain: string;
  isActive: boolean;
  subscription: { plan: string; status: string };
  branding?: { primaryColor: string };
  ownerId: { name: string; email: string; lastLogin: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/admin/vendors");
        setVendors(data.vendors || []);
        setStats({
          totalVendors: data.count,
          activeVendors: data.vendors.filter((v: Vendor) => v.isActive).length,
          totalCustomers: 100, // This would come from customers API
          totalRevenue: 1000,    // This would come from orders API
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Vendors",
      value: stats?.totalVendors ?? 0,
      icon: Store,
      gradient: "from-amber-400 to-orange-500",
      lightBg: "bg-amber-50",
      change: `${stats?.activeVendors ?? 0} active now`,
      suffix: "",
    },
    {
      label: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      gradient: "from-blue-400 to-blue-500",
      lightBg: "bg-blue-50",
      change: "+12% this month",
      suffix: "",
    },
    {
      label: "Platform Revenue",
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      gradient: "from-green-400 to-emerald-500",
      lightBg: "bg-green-50",
      change: "Last 30 days",
      suffix: "$",
    },
    {
      label: "Growth Rate",
      value: 23.5,
      icon: TrendingUp,
      gradient: "from-purple-400 to-purple-500",
      lightBg: "bg-purple-50",
      change: "↑ 8.2% from last month",
      suffix: "%",
    },
  ];

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case "premium": return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      case "pro": return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
            <div className="px-3 py-1 bg-amber-100 rounded-full">
              <span className="text-xs font-bold text-amber-700">Admin</span>
            </div>
          </div>
          <p className="text-gray-500 flex items-center gap-2 ml-2">
            <Sparkles size={14} className="text-amber-400" />
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <Link 
          href="/admin/vendors/create"
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 self-start"
        >
          <Plus size={18} />
          <span>Add Vendor</span>
        </Link>
      </div>

      {/* Stats Cards - Simple & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, gradient, lightBg, change, suffix }) => (
          <div 
            key={label} 
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {change}
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">
              {suffix}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Vendors - Clean Table without 3-dots */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <h2 className="font-black text-gray-900 text-lg">Recent Vendors</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              {vendors.length} total
            </span>
          </div>
          <Link 
            href="/admin/vendors" 
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            View All
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {vendors.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store size={28} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No vendors yet</h3>
            <p className="text-gray-400 text-sm mb-6">Get started by adding your first vendor store</p>
            <Link 
              href="/admin/vendors/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-200"
            >
              <Plus size={16} />
              Add Your First Vendor
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.slice(0, 5).map((v, index) => (
                  <tr 
                    key={v._id} 
                    className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                          style={{ backgroundColor: v.branding?.primaryColor || '#F59E0B' }}
                        >
                          {getInitials(v.storeName)}
                        </div>
                        <div>
                          <Link 
                            href={`/admin/vendors/${v._id}`}
                            className="font-semibold text-gray-900 text-sm hover:text-amber-600 transition-colors"
                          >
                            {v.storeName}
                          </Link>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            {v.subdomain}.multistore.com
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{v.ownerId?.name}</p>
                      <p className="text-xs text-gray-400">{v.ownerId?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${getPlanColor(v.subscription.plan)}`}>
                        {v.subscription.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {v.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold border border-green-200">
                          <CheckCircle size={12} className="text-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 text-red-700 text-xs font-semibold border border-red-200">
                          <XCircle size={12} className="text-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(v.createdAt).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity - Clean Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-white" />
              </div>
              <h2 className="font-black text-gray-900">Recent Activity</h2>
            </div>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full font-medium">
              Live
            </span>
          </div>
          
          <div className="space-y-4">
            {vendors.slice(0, 5).map((v, index) => (
              <div 
                key={v._id} 
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(v.storeName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-bold">{v.storeName}</span> was created
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(v.createdAt).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <span className="text-xs text-amber-600 font-medium">
                      {v.subscription.plan} plan
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Just now
                </span>
              </div>
            ))}
            
            {vendors.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
            )}
          </div>
        </div>

      
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-xl" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-12 w-32 bg-gray-200 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
            <div className="h-8 w-24 bg-gray-200 rounded-lg mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-8 w-32 bg-gray-200 rounded-lg mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-lg w-32" />
                <div className="h-3 bg-gray-100 rounded-lg w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}