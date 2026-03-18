import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  stock: number;
  quantity: number;
  vendorSubdomain: string;
}

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;

  // Derived helpers
  getItemCount: () => number;
  getSubtotal: () => number;
  getItemsByVendor: (subdomain: string) => CartItem[];
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        addItem: (item, qty = 1) =>
          set(
            (state) => {
              const existing = state.items.find((i) => i._id === item._id);
              if (existing) {
                const newQty = Math.min(existing.quantity + qty, item.stock);
                return {
                  items: state.items.map((i) =>
                    i._id === item._id ? { ...i, quantity: newQty } : i
                  ),
                };
              }
              return {
                items: [
                  ...state.items,
                  { ...item, quantity: Math.min(qty, item.stock) },
                ],
              };
            },
            false,
            "addItem"
          ),

        removeItem: (id) =>
          set(
            (state) => ({
              items: state.items.filter((i) => i._id !== id),
            }),
            false,
            "removeItem"
          ),

        updateQuantity: (id, qty) =>
          set(
            (state) => {
              if (qty <= 0) {
                return { items: state.items.filter((i) => i._id !== id) };
              }
              return {
                items: state.items.map((i) =>
                  i._id === id
                    ? { ...i, quantity: Math.min(qty, i.stock) }
                    : i
                ),
              };
            },
            false,
            "updateQuantity"
          ),

        clearCart: () => set({ items: [] }, false, "clearCart"),

        getItemCount: () =>
          get().items.reduce((sum, i) => sum + i.quantity, 0),

        getSubtotal: () =>
          get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

        getItemsByVendor: (subdomain) =>
          get().items.filter((i) => i.vendorSubdomain === subdomain),
      }),
      { name: "cart-storage" }
    ),
    { name: "CartStore" }
  )
);
