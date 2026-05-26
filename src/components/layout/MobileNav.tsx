"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Heart, ShoppingCart, User, LayoutGrid } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const isAdmin = pathname?.startsWith('/admin');
  const isAdvisor = pathname === '/advisor';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  // Do not render bottom nav on admin pages or advisor page
  if (isAdmin || isAdvisor) return null;

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Categories", icon: LayoutGrid, path: "/categories" },
    { name: "Wishlist", icon: Heart, path: "/favorites", badge: wishlistCount },
    { name: "Cart", icon: ShoppingCart, path: "/cart", badge: cartCount },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-blue-200/20 px-6 pt-1.5 shadow-[0_-10px_40px_rgba(37,99,235,0.1)] transform-gpu overflow-hidden print:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="flex justify-between items-center max-w-lg mx-auto h-12">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isProfile = item.name === "Profile";
          
          return (
            <Link key={item.name} href={item.path} className="h-full">
              <div className="flex flex-col items-center gap-0.5 relative">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "text-blue-600 bg-blue-600/10" : "text-slate-400"
                )}>
                  {isProfile && profile?.avatar_url ? (
                    <Avatar className={cn("h-5 w-5 rounded-full", isActive && "ring-2 ring-blue-600 ring-offset-2")}>
                      <AvatarImage src={profile.avatar_url} className="object-cover" />
                      <AvatarFallback className="rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                        {session?.user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[8px] font-black h-3.5 min-w-3.5 flex items-center justify-center rounded-full border border-background px-0.5 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[8px] font-bold tracking-tight uppercase",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}