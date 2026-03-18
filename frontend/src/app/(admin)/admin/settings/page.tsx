"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Settings, Globe, Mail, Shield, Bell,
  CreditCard, Users, Store, ArrowLeft,
  Save, Check, AlertCircle, Moon, Sun,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    // General
    siteName: "MultiStore",
    siteUrl: "https://multistore.com",
    adminEmail: "admin@multistore.com",
    
    // Notifications
    emailNotifications: true,
    vendorCreated: true,
    vendorDeactivated: true,
    newOrder: false,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
    
    // Branding
    theme: "light",
    primaryColor: "#F59E0B",
  });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "branding", label: "Branding", icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/dashboard"
          className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Settings size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-500 ml-2">Manage your platform preferences</p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === id 
                    ? 'border-amber-500 text-amber-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => handleChange("siteUrl", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleChange("adminEmail", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              {[
                { id: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for important events" },
                { id: "vendorCreated", label: "Vendor Created", desc: "When a new vendor registers" },
                { id: "vendorDeactivated", label: "Vendor Deactivated", desc: "When a vendor is deactivated" },
                { id: "newOrder", label: "New Orders", desc: "When customers place orders" },
              ].map(({ id, label, desc }) => (
                <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[id as keyof typeof settings] as boolean}
                      onChange={(e) => handleChange(id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:to-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-400 mt-0.5">Add extra security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleChange("twoFactorAuth", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:to-orange-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <span>Password changes and security logs are available in the audit section.</span>
                </p>
              </div>
            </div>
          )}

          {/* Branding Settings */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Theme Mode
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleChange("theme", "light")}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                      ${settings.theme === 'light' 
                        ? 'border-amber-400 bg-amber-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Sun size={20} className={settings.theme === 'light' ? 'text-amber-500' : 'text-gray-400'} />
                    <span className="font-medium text-gray-900">Light</span>
                  </button>
                  <button
                    onClick={() => handleChange("theme", "dark")}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                      ${settings.theme === 'dark' 
                        ? 'border-amber-400 bg-amber-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Moon size={20} className={settings.theme === 'dark' ? 'text-amber-500' : 'text-gray-400'} />
                    <span className="font-medium text-gray-900">Dark</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-4">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">This color will be used for buttons and accents</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleChange("primaryColor", color)}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check size={16} />
                Settings saved!
              </div>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-white rounded-2xl border-2 border-red-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-red-200">
          <h2 className="font-black text-red-600 flex items-center gap-2">
            <AlertCircle size={18} />
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Delete Platform</p>
              <p className="text-xs text-gray-400 mt-1">Permanently delete your platform and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}