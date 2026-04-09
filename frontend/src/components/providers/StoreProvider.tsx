"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { THEMES, type Theme } from "@/config/themes";

export interface StoreData {
  storeName: string;
  subdomain: string;
  theme: string;
  template: string;
  branding: {
    logo: string | null;
    storeBanner: string | null;
    tagline: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    bgColor: string;
    navBg: string;
    navText: string;
    buttonBg: string;
    buttonText: string;
    borderColor: string;
  };
  contact: {
    email: string | null;
    phone: string | null;
  };
  payment?: {
    esewa?: {
      merchantCode?: string | null;
      isEnabled?: boolean;
    };
    khalti?: {
      isEnabled?: boolean;
    };
  };
}

interface StoreContextValue {
  store: StoreData | null;
  themeColors: Theme;
  template: string;
  loading: boolean;
  error: boolean;
}

const StoreContext = createContext<StoreContextValue>({
  store: null,
  themeColors: THEMES["sunrise"],
  template: "template1",
  loading: true,
  error: false,
});

export const useStore = () => useContext(StoreContext);

export default function StoreProvider({
  subdomain,
  children,
}: {
  subdomain: string;
  children: ReactNode;
}) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/store/${subdomain}`)
      .then((r) => {
        if (!r.ok) throw new Error("Store not found");
        return r.json();
      })
      .then((data) => setStore(data.store))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [subdomain]);

  const themeColors = THEMES[store?.theme || "sunrise"];
  const template = store?.template || "template1";

  return (
    <StoreContext.Provider value={{ store, themeColors, template, loading, error }}>
      {children}
    </StoreContext.Provider>
  );
}
