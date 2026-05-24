"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfilePrompt() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setShow(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("contact, location")
        .eq("id", session.user.id)
        .maybeSingle();

      // Show if logged in but missing critical ordering info
      if (!error && (!data?.contact || !data?.location)) {
        setShow(true);
      } else {
        setShow(false);
      }
    }

    checkProfile();

    // Listen for changes (e.g. user updates profile)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkProfile();
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  // Don't show on profile page (they are already there) or admin pages
  if (!show || pathname === "/profile" || pathname?.startsWith("/admin")) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 py-3 px-6 animate-in slide-in-from-top duration-500 sticky top-[72px] z-40 no-print">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-full shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-amber-900">
            Action Required: <span className="font-medium text-amber-700">Please complete your profile details to enable order placement.</span>
          </p>
        </div>
        <Link href="/profile">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl gap-2 shadow-lg shadow-amber-600/20 h-9">
            Complete Setup <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
