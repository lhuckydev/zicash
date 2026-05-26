import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductVariant {
  id: string;
  product_id: string;
  label: string;
  price: number;
  stock: number;
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  screen?: string;
  touchscreen?: boolean;
  keyboard_light?: boolean;
  condition?: string;
  chipset?: string;
  color?: string;
  battery?: string;
  network?: string;
  is_default?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  image_url: string;
  image_urls?: string[];
  featured: boolean;
  warranty: string;
  stock_status: string;
  price: number; // Base price or starting price
  variants?: ProductVariant[];
  advanced_specs?: any;
  touchscreen?: boolean;
  keyboard_light?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  selectedVariant?: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product, variant) => {
        const currentItems = get().items;
        // Unique key: product_id + variant_id (if exists)
        const cartId = variant ? `${product.id}-${variant.id}` : product.id;
        
        const existingItem = currentItems.find((item) => {
          const itemVariantId = item.selectedVariant?.id;
          const targetVariantId = variant?.id;
          return item.id === product.id && itemVariantId === targetVariantId;
        });

        let updatedItems: CartItem[];
        if (existingItem) {
          updatedItems = currentItems.map((item) => {
            const itemVariantId = item.selectedVariant?.id;
            const targetVariantId = variant?.id;
            if (item.id === product.id && itemVariantId === targetVariantId) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          });
        } else {
          updatedItems = [...currentItems, { ...product, selectedVariant: variant, quantity: 1 }];
        }
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      removeItem: (cartId) => {
        const updatedItems = get().items.filter((item) => {
          const currentId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
          return currentId !== cartId;
        });
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      updateQuantity: (cartId, quantity) => {
        const updatedItems = get().items.map((item) => {
          const currentId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
          if (currentId === cartId) {
            return { ...item, quantity: Math.max(0, quantity) };
          }
          return item;
        }).filter(item => item.quantity > 0);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      setItems: (items) => {
        set({ items, total: calculateTotal(items) });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: 'zicash-cart-storage-v2' }
  )
);

function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => {
    const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.price;
    return sum + (unitPrice * item.quantity);
  }, 0);
}
