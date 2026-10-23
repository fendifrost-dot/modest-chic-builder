import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  handle: string;
  title: string;
  image?: string;
  variantId: string;
  variantTitle: string;
  printifyProductId: string;
  printifyVariantId: number;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => boolean;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<{ ok: boolean; error?: string }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        const existing = get().items.find((entry) => entry.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((entry) =>
              entry.variantId === item.variantId ? { ...entry, quantity: entry.quantity + quantity } : entry,
            ),
          });
          return true;
        }
        set({ items: [...get().items, { ...item, quantity }] });
        return true;
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
        });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((item) => item.variantId !== variantId) });
      },

      clearCart: () => set({ items: [] }),

      checkout: async () => {
        const items = get().items;
        if (items.length === 0) return { ok: false, error: "Your cart is empty." };
        set({ isLoading: true });
        try {
          const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((item) => ({
                productId: item.productId,
                handle: item.handle,
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            }),
          });
          const body = await response.json();
          if (!response.ok || !body.url) {
            return { ok: false, error: body.error || "Checkout is unavailable." };
          }
          window.location.assign(body.url);
          return { ok: true };
        } catch {
          return { ok: false, error: "Checkout is unavailable." };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "modest-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
