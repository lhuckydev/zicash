import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './useCartStore';

interface WishlistStore {
  items: Product[];
  toggleItem: (product: Product) => void;
  hasItem: (productId: string) => boolean;
  setItems: (items: Product[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);
        
        if (exists) {
          set({ items: currentItems.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...currentItems, product] });
        }
      },
      hasItem: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      setItems: (items) => set({ items }),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'zicash-wishlist-storage' }
  )
);
