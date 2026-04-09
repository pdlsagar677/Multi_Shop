import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/axios";

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  country: string;
  phone: string;
  label: "home" | "work" | "other";
  isDefault: boolean;
}

interface AddressState {
  addresses: Address[];
  loading: boolean;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, "_id" | "isDefault">) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>()(
  devtools(
    (set) => ({
      addresses: [],
      loading: false,

      fetchAddresses: async () => {
        try {
          set({ loading: true }, false, "fetchAddresses/start");
          const { data } = await api.get("/addresses");
          set({ addresses: data.addresses || [], loading: false }, false, "fetchAddresses/done");
        } catch {
          set({ loading: false }, false, "fetchAddresses/error");
        }
      },

      addAddress: async (address) => {
        const { data } = await api.post("/addresses", address);
        set(
          (state) => ({ addresses: [...state.addresses, data.address] }),
          false,
          "addAddress"
        );
      },

      updateAddress: async (id, address) => {
        const { data } = await api.put(`/addresses/${id}`, address);
        set(
          (state) => ({
            addresses: state.addresses.map((a) =>
              a._id === id ? data.address : (address.isDefault ? { ...a, isDefault: false } : a)
            ),
          }),
          false,
          "updateAddress"
        );
      },

      deleteAddress: async (id) => {
        await api.delete(`/addresses/${id}`);
        set(
          (state) => ({ addresses: state.addresses.filter((a) => a._id !== id) }),
          false,
          "deleteAddress"
        );
      },
    }),
    { name: "AddressStore" }
  )
);
