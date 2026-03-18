"use client";
import { useStore } from "@/components/providers/StoreProvider";

export default function StoreFooter() {
  const { store, themeColors: theme } = useStore();

  if (!store) return null;

  return (
    <footer
      className="border-t mt-auto"
      style={{ borderColor: theme.borderColor, backgroundColor: theme.cardBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
              style={{
                backgroundColor: theme.primaryColor,
                color: theme.buttonText,
              }}
            >
              {store.storeName[0].toUpperCase()}
            </div>
            <span className="text-sm font-bold" style={{ color: theme.textColor }}>
              {store.storeName}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
