"use client";
import { useStore } from "@/components/providers/StoreProvider";

export default function FooterLayout() {
  const { store, themeColors: theme } = useStore();

  if (!store) return null;

  return (
    <footer
      className="border-t py-6 text-center"
      style={{ borderColor: theme.borderColor }}
    >
      <p className="text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {store.storeName}
      </p>
    </footer>
  );
}
