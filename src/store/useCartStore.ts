import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  specs: string;
  category: string;
  brand: string;
  image_url: string;
  image_urls?: string[]; // Added for multi-image support
  stock: number;
  // Electronics Fields (Laptops / Phones)
  ram_size?: string;
  ram_type?: string;
  storage_size?: string;
  storage_type?: string;
  cpu?: string;
  gpu?: string;
  vram?: string;
  battery?: string;
  camera?: string; // New: Specific for Phones
  screen_size?: string;
  clock_speed?: string;
  screen_resolution?: string;
  refresh_rate?: string;
  webcam?: string;
  fingerprint?: string;
  keyboard_backlit?: string;
  ports?: string;
  // Closet Fields
  size?: string;
  material?: string;
  condition?: string;
  color?: string;
  // Consult Fields
  service_type?: string;
  duration?: string;
  requirement?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        let updatedItems: CartItem[];
        if (existingItem) {
          updatedItems = currentItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updatedItems = [...currentItems, { ...product, quantity: 1 }];
        }
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      updateQuantity: (productId, quantity) => {
        const updatedItems = get().items.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      setItems: (items) => {
        set({ items, total: calculateTotal(items) });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: 'zicash-cart-storage' }
  )
);

function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
