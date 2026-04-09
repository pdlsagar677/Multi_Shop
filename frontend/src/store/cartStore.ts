import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/axios";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
  discountPercent: number;
  discountValidUntil: string | null;
  isActive: boolean;
  isFeatured: boolean;
  effectivePrice?: number;
}

export interface CartItem {
  productId: CartProduct;
  quantity: number;
  _id: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Derived helpers
  getItemCount: () => number;
  getSubtotal: () => number;
  hasOutOfStockItems: () => boolean;
}

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      loading: false,

      fetchCart: async () => {
        try {
          set({ loading: true }, false, "fetchCart/start");
          const { data } = await api.get("/cart");
          set(
            { items: data.cart?.items || [], loading: false },
            false,
            "fetchCart/done"
          );
        } catch {
          set({ items: [], loading: false }, false, "fetchCart/error");
        }
      },

      addItem: async (productId, quantity = 1) => {
        try {
          set({ loading: true }, false, "addItem/start");
          const { data } = await api.post("/cart", { productId, quantity });
          set(
            { items: data.cart?.items || [], loading: false },
            false,
            "addItem/done"
          );
        } catch (err: any) {
          set({ loading: false }, false, "addItem/error");
          throw err;
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          const { data } = await api.put("/cart", { productId, quantity });
          set({ items: data.cart?.items || [] }, false, "updateQuantity");
        } catch (err: any) {
          throw err;
        }
      },

      removeItem: async (productId) => {
        try {
          const { data } = await api.delete(`/cart/item/${productId}`);
          set({ items: data.cart?.items || [] }, false, "removeItem");
        } catch (err: any) {
          throw err;
        }
      },

      clearCart: async () => {
        try {
          await api.delete("/cart");
          set({ items: [] }, false, "clearCart");
        } catch {
          // ignore
        }
      },

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => {
          const product = i.productId;
          if (!product) return sum;
          const price = product.effectivePrice ?? product.price;
          return sum + price * i.quantity;
        }, 0),

      hasOutOfStockItems: () =>
        get().items.some((i) => i.productId && i.productId.stock <= 0),
    }),
    { name: "CartStore" }
  )
);
