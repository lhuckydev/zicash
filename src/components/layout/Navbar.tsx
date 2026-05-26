"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, Product } from "@/store/useCartStore";
import { ShoppingCart, Heart, Settings as SettingsIcon, Package, Menu, Search, LogOut, LayoutGrid, Zap, BrainCircuit, Info, Phone, Gavel, X, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { buttonTap } from "@/lib/animations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const isAdminPath = pathname?.startsWith('/admin');

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
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSearchOpen]);

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

  const mainNavLinks = [
    { name: "Shop", path: "/", icon: LayoutGrid },
    { name: "Departments", path: "/categories", icon: Zap },
    { name: "Expert Helper", path: "/advisor", icon: BrainCircuit },
  ];

  const secondaryLinks = [
    { name: "Our Vision", path: "/about", icon: Info },
    { name: "Support Center", path: "/contact", icon: Phone },
    { name: "Market Policy", path: "/terms", icon: Gavel },
  ];

  const allMobileLinks = [...mainNavLinks, ...secondaryLinks];

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "sticky top-0 w-full bg-white/90 backdrop-blur-xl border-b border-blue-100/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500",
          isSearchOpen ? "z-[100]" : "z-50"
        )}
      >
        <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
          
          {/* Top Row: Center Logo (Mobile) / Logo + Desktop Nav (Desktop) */}
          <div className="flex items-center justify-between w-full">
            <div className="hidden lg:flex items-center gap-3">
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

            {/* Mobile Centered Logo */}
            <div className="flex lg:hidden flex-1 justify-center items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8 overflow-hidden rounded-full border border-slate-100 bg-white">
                  <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="Logo" width={32} height={32} className="object-cover" />
                </div>
                <span className="font-bold text-lg text-slate-900 font-headline uppercase tracking-tight">Zi<span className="text-blue-600">Cash GH</span></span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8 mx-12">
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

            {/* Desktop Right Actions (Hidden on Mobile row 1) */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/cart" className="relative p-2 text-slate-400 hover:text-blue-600">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black h-4 min-w-4 flex items-center justify-center rounded-full border-2 border-white px-1">{cartCount}</span>}
              </Link>
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer"><AvatarImage src={profile?.avatar_url} /><AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">{session.user.email[0].toUpperCase()}</AvatarFallback></Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-2xl"><DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Account</DropdownMenuLabel><DropdownMenuSeparator />{/* ... menu items ... */}<DropdownMenuItem onClick={handleLogout} className="text-red-600"><LogOut className="mr-3 h-4 w-4" />Logout</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth"><Button className="rounded-full bg-blue-600 text-white font-bold h-10 px-5 text-xs">Login</Button></Link>
              )}
            </div>
          </div>

          {/* Bottom Row: Mobile Toolbar (Menu + Search + Icons) */}
          <div className="flex lg:hidden items-center gap-2 w-full px-0.5 pb-1">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500 h-10 w-10 shrink-0">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-none rounded-r-[2rem] shadow-2xl">
                <SheetHeader className="p-8 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border bg-white overflow-hidden"><Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="Logo" width={40} height={40} /></div>
                    <span className="text-xl font-black text-slate-900 font-headline uppercase">ZiCash <span className="text-blue-600">GH</span></span>
                  </div>
                </SheetHeader>
                <div className="flex flex-col p-6 space-y-2">
                  {allMobileLinks.map((link) => (
                    <Link key={link.path} href={link.path} onClick={() => setIsMenuOpen(false)} className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold text-sm", pathname === link.path ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>
                      <link.icon className="w-5 h-5" /> {link.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <div 
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 h-10 pl-10 pr-4 rounded-full border border-slate-200 bg-slate-50 flex items-center relative cursor-pointer"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <span className={cn("text-xs font-bold truncate", searchQuery ? "text-slate-900" : "text-slate-400")}>
                {searchQuery || "Find items..."}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link href="/cart" className="relative p-2 text-slate-500">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">{cartCount}</span>}
              </Link>
              {session ? (
                <Link href="/profile">
                  <Avatar className="h-8 w-8 border border-slate-100 shadow-sm">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">{session.user.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link href="/auth" className="p-2 text-slate-500"><SettingsIcon className="w-5 h-5" /></Link>
              )}
            </div>
          </div>

        </div>
      </motion.nav>

      {/* Full-Screen Search Overhaul Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col"
          >
            {/* Clickable Area to Close */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
            
            {/* Search Box & Content */}
            <motion.div 
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              className="relative w-full max-w-2xl mx-auto mt-4 md:mt-10 px-4 z-[1100]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-blue-50">
                <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-5 w-4 h-4 text-blue-600" />
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                      <Input 
                        ref={inputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for hardware..." 
                        className="pl-12 pr-12 h-14 bg-blue-50/30 border-none rounded-full text-lg font-bold focus-visible:ring-0"
                      />
                    </form>
                    <div className="absolute right-2 flex items-center gap-1">
                      {searchQuery && (
                        <button onClick={clearQuery} className="p-2 text-slate-300 hover:text-blue-600"><X className="w-5 h-5" /></button>
                      )}
                      <Button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest px-6 h-10">Search</Button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
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
                            <Search className="w-4 h-4 text-blue-300" />
                            <span className="text-sm font-black text-slate-700 group-hover:text-blue-600">{p.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Quick Sections</p>
                        <div className="grid grid-cols-2 gap-3">
                          {['Laptops', 'Phones', 'Accessories', 'Closet'].map((cat) => (
                            <button key={cat} onClick={() => { setIsSearchOpen(false); router.push('/categories'); }} className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group">
                              <span className="text-xs font-black uppercase tracking-widest italic">{cat}</span>
                              <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
