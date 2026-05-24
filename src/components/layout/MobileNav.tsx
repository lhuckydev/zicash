"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Home, Search, Heart, ShoppingCart, User, X, Loader2 } from "lucide-react";
import { useCartStore, Product } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!isSearchOpen || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(6);
      
      if (data) setSuggestions(data);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Do not render bottom nav on admin pages or advisor page
  if (isAdmin || isAdvisor) return null;

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { 
      name: "Search", 
      icon: Search, 
      path: "#", 
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSearchOpen(true);
      } 
    },
    { name: "Wishlist", icon: Heart, path: "/favorites", badge: wishlistCount },
    { name: "Cart", icon: ShoppingCart, path: "/cart", badge: cartCount },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <>
      {/* Mobile Bottom Bar (Synced with global blue theme) */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-blue-200/20 px-6 pt-1.5 shadow-[0_-10px_40px_rgba(37,99,235,0.1)] transform-gpu overflow-hidden print:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <div className="flex justify-between items-center max-w-lg mx-auto h-12">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const isProfile = item.name === "Profile";
            
            const content = (
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
            );

            if (item.onClick) {
              return <button key={item.name} onClick={item.onClick} className="outline-none h-full">{content}</button>;
            }

            return (
              <Link key={item.name} href={item.path} className="h-full">
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Full Screen Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-background animate-in slide-in-from-bottom duration-300 flex flex-col print:hidden">
          <div className="p-6 flex items-center gap-4 border-b border-blue-100/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <form onSubmit={handleSearchSubmit}>
                <Input 
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find hardware..." 
                  className="pl-10 h-12 bg-white/50 border-none rounded-2xl focus-visible:ring-blue-600/20"
                />
              </form>
            </div>
            <button 
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="p-2 bg-white/50 rounded-xl text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-20" />
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Results</p>
                <div className="grid grid-cols-1 gap-3">
                  {suggestions.map((p) => (
                    <Link 
                      key={p.id} 
                      href={`/product/${p.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/20"
                    >
                      <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden border border-slate-100 shrink-0">
                        <Image src={p.image_url} alt={p.name} width={56} height={56} className="object-contain p-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs font-bold text-blue-600">GH₵{p.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Type to search index...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
