"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/useCartStore";

export function CartSync() {
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const isFirstRender = useRef(true);
  const isSyncingFromDb = useRef(false);

  // Sync from DB on Login
  useEffect(() => {
    const handleSyncFromDb = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from("carts")
          .select("items")
          .eq("user_id", session.user.id)
          .single();

        if (data?.items && !error) {
          isSyncingFromDb.current = true;
          // Merge logic or overwrite? User likely wants their saved cart back
          setItems(data.items);
          setTimeout(() => { isSyncingFromDb.current = false; }, 500);
        }
      }
    };

    handleSyncFromDb();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleSyncFromDb();
      }
    });

    return () => subscription.unsubscribe();
  }, [setItems]);

  // Sync to DB on Change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isSyncingFromDb.current) return;

    const syncToDb = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await supabase
          .from("carts")
          .upsert({
            user_id: session.user.id,
            items: items,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }
    };

    const timeoutId = setTimeout(syncToDb, 1000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [items]);

  return null; // Silent component
}
