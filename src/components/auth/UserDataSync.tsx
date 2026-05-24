"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export function UserDataSync() {
  const cartItems = useCartStore((state) => state.items);
  const setCartItems = useCartStore((state) => state.setItems);
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const setWishlistItems = useWishlistStore((state) => state.setItems);

  const isFirstRender = useRef(true);
  const isSyncingFromDb = useRef(false);

  // Sync from DB on Login
  useEffect(() => {
    let active = true;

    const handleSyncFromDb = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user && active) {
        isSyncingFromDb.current = true;

        try {
          // Fetch Cart
          const { data: cartData } = await supabase
            .from("carts")
            .select("items")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (cartData?.items && active) {
            setCartItems(cartData.items);
          }

          // Fetch Wishlist
          const { data: wishlistData } = await supabase
            .from("wishlists")
            .select("items")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (wishlistData?.items && active) {
            setWishlistItems(wishlistData.items);
          }
        } catch (err) {
          console.error("Sync Error:", err);
        } finally {
          if (active) {
            setTimeout(() => { isSyncingFromDb.current = false; }, 500);
          }
        }
      }
    };

    handleSyncFromDb();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleSyncFromDb();
      }
      if (event === 'SIGNED_OUT') {
        // Optional: clear state on logout if desired
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setCartItems, setWishlistItems]);

  // Sync Cart to DB
  useEffect(() => {
    if (isFirstRender.current) return;
    if (isSyncingFromDb.current) return;

    const syncCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("carts")
          .upsert({
            user_id: session.user.id,
            items: cartItems,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }
    };

    const timeoutId = setTimeout(syncCart, 1500); // Increased debounce
    return () => clearTimeout(timeoutId);
  }, [cartItems]);

  // Sync Wishlist to DB
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isSyncingFromDb.current) return;

    const syncWishlist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("wishlists")
          .upsert({
            user_id: session.user.id,
            items: wishlistItems,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }
    };

    const timeoutId = setTimeout(syncWishlist, 1500); // Increased debounce
    return () => clearTimeout(timeoutId);
  }, [wishlistItems]);

  return null;
}
