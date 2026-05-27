"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, Product } from "@/store/useCartStore";
import { 
  ShoppingCart, 
  Heart, 
  Settings as SettingsIcon, 
  Package, 
  Menu, 
  Search, 
  LogOut, 
  LayoutGrid, 
  Zap, 
  BrainCircuit, 
  Info, 
  Phone, 
  Gavel, 
  X, 
  Loader2, 
  ChevronRight, 
  ShoppingBag, 
  User,
  ShieldCheck,
  CreditCard,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAILS = ['zicashonline@gmail.com', 'ericboatenglucky@gmail.com'];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
          .limit(8);
        
        if (!error && data) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Discovery error", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen || isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSearchOpen, isMenuOpen]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    setIsMenuOpen(false);
    router.push("/");
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const clearQuery = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  const mainNavLinks = [
    { name: "Shop", path: "/", icon: LayoutGrid },
    { name: "Categories", path: "/categories", icon: Zap },
    { name: "AI Helper", path: "/advisor", icon: BrainCircuit },
  ];

  const secondaryLinks = [
    { name: "Our Vision", path: "/about", icon: Info },
    { name: "Support Center", path: "/contact", icon: Phone },
    { name: "Market Policy", path: "/terms", icon: Gavel },
  ];

  return (
    <>
      <nav className={cn(
        "sticky top-0 w-full bg-white/95 backdrop-blur-xl border-b border-blue-100/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500",
        isSearchOpen || isMenuOpen ? "z-[2000]" : "z-50"
      )}>
        <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
          
          <div className="flex lg:hidden justify-center items-center pt-1 pb-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 overflow-hidden rounded-full border border-slate-100 bg-white shadow-sm shrink-0">
                <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="Logo" width={32} height={32} className="object-cover" />
              </div>
              <span className="font-bold text-lg text-slate-900 font-headline uppercase tracking-tight">Zi<span className="text-blue-600">Cash GH</span></span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="relative w-10 h-10 overflow-hidden rounded-full shadow-sm bg-white border border-slate-100">
                  <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="Logo" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-slate-900 font-headline leading-none uppercase tracking-tight">Zi<span className="text-blue-600">Cash GH</span></span>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Premium Marketplace</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-8 mx-12">
              {mainNavLinks.map((link) => (
                <Link key={link.path} href={link.path} className="relative py-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em] transition-colors", pathname === link.path ? "text-blue-600" : "text-slate-400 hover:text-slate-900")}>
                    {link.name}
                  </span>
                  {pathname === link.path && (
                    <motion.div layoutId="navActive" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="w-48 h-10 px-4 rounded-full border border-slate-200 bg-slate-50 flex items-center gap-3 cursor-pointer text-slate-400 hover:border-blue-300 transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-bold truncate">{searchQuery || "Search items..."}</span>
              </div>
              <Link href="/cart" className="relative p-2 text-slate-400 hover:text-blue-600">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black h-4 min-w-4 flex items-center justify-center rounded-full border-2 border-white px-1">{cartCount}</span>}
              </Link>
              
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer hover:ring-4 hover:ring-blue-500/10 transition-all">
                      <AvatarImage src={profile?.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold uppercase">{session.user.email[0]}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-2 border-slate-100 shadow-2xl mt-2 animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="p-4 flex flex-col gap-0.5">
                       <p className="text-xs font-black text-slate-900 uppercase italic truncate">{profile?.full_name || 'Premium Shopper'}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{session.user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-50" />
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Account Identity</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/orders')} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Order History</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <Settings2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Store Manager</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-50" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer text-red-500 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Safe Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth"><Button className="rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-xl shadow-blue-600/20">Sign In</Button></Link>
              )}
            </div>
          </div>

          <div className="flex lg:hidden items-center gap-2 w-full">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 h-10 pl-10 pr-4 rounded-full border border-slate-200 bg-slate-50 flex items-center relative cursor-pointer"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <span className={cn("text-xs font-bold truncate", searchQuery ? "text-slate-900" : "text-slate-400")}>
                {searchQuery || "Find items..."}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/cart" className="relative p-2 text-slate-500">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">{cartCount}</span>}
              </Link>
              {session ? (
                <Link href="/profile">
                  <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">{session.user.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="h-9 px-4 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[3000] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMenuOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ type: "spring", stiffness: 400, damping: 35 }} 
              className="relative h-full w-[85%] max-w-[300px] bg-white shadow-2xl rounded-r-[2.5rem] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border bg-white overflow-hidden shadow-sm">
                    <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="Logo" width={40} height={40} />
                  </div>
                  <span className="text-xl font-black text-slate-900 font-headline uppercase">ZiCash <span className="text-blue-600">GH</span></span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4">Main Navigation</p>
                
                {mainNavLinks.map((link) => (
                  <Link key={link.path} href={link.path} onClick={() => setIsMenuOpen(false)} className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold text-sm", pathname === link.path ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50")}>
                    <link.icon className="w-5 h-5" /> {link.name}
                  </Link>
                ))}

                {session && (
                  <Link href="/orders" onClick={() => setIsMenuOpen(false)} className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold text-sm", pathname === "/orders" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50")}>
                    <ShoppingBag className="w-5 h-5" /> My Orders
                  </Link>
                )}

                <div className="pt-8 mt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4">More Info</p>
                  {secondaryLinks.map((link) => (
                    <Link key={link.path} href={link.path} onClick={() => setIsMenuOpen(false)} className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold text-sm", pathname === link.path ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50")}>
                      <link.icon className="w-5 h-5" /> {link.name}
                    </Link>
                  ))}
                </div>

                {session && (
                  <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-sm text-red-500 w-full hover:bg-red-50 transition-colors mt-8">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[3000] flex flex-col">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setIsSearchOpen(false)} 
            />
            <motion.div 
              initial={{ y: -50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -50, opacity: 0 }} 
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl mx-auto mt-4 md:mt-10 px-4 z-[3100]" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-50">
                <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-5 w-4 h-4 text-blue-600" />
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                      <Input ref={inputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for hardware..." className="pl-12 pr-12 h-14 bg-blue-50/30 border-none rounded-full text-lg font-bold focus-visible:ring-0" />
                    </form>
                    <div className="absolute right-2 flex items-center gap-1">
                      {searchQuery && <button onClick={clearQuery} className="p-2 text-slate-300 hover:text-blue-600"><X className="w-5 h-5" /></button>}
                      <Button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg shadow-blue-600/20">Search</Button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto scrollbar-hide bg-white">
                  {isSearching ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-20" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Catalog...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-col">
                      {suggestions.map((p) => (
                        <button key={p.id} onClick={() => { setIsSearchOpen(false); router.push(`/product/${p.id}`); }} className="flex items-center justify-between px-8 py-5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 group">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center p-1 border border-slate-100 shrink-0">
                              <Image src={p.image_url} alt={p.name} width={24} height={24} className="object-contain" />
                            </div>
                            <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 text-left">{p.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Browse Sections</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Laptops', 'Phones', 'Accessories', 'Closet'].map((cat) => (
                          <button key={cat} onClick={() => { setIsSearchOpen(false); router.push('/categories'); }} className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group shadow-sm">
                            <span className="text-xs font-black uppercase tracking-widest italic">{cat}</span>
                            <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setIsSearchOpen(false)} className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">Close Tool <X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
