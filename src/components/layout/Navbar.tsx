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
        <div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
          
          {/* Header Row: Menu, Logo, Icons (Mobile/Desktop Sync) */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex items-center gap-3">
              {!isAdminPath && (
                <div className="lg:hidden">
                  <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-500 h-9 w-9">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] p-0 border-none rounded-r-[2rem] shadow-2xl">
                      <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex flex-row items-center gap-4">
                          <div className="relative w-12 h-12 overflow-hidden rounded-full shadow-md border border-white bg-white shrink-0">
                            <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={48} height={48} className="object-cover" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-2xl font-black font-headline tracking-tighter text-slate-900 leading-none">
                              Zi<span className="text-blue-600">Cash</span>
                            </span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                              GH Limited
                            </span>
                          </div>
                        </div>
                      </SheetHeader>
                      <div className="flex flex-col p-6 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Market Navigation</p>
                        {allMobileLinks.map((link) => (
                          <Link 
                            key={link.path} 
                            href={link.path} 
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm group",
                              pathname === link.path ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <link.icon className={cn("w-5 h-5", pathname === link.path ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}

              <Link href="/" className="flex items-center gap-2 shrink-0">
                <motion.div whileHover={{ rotate: 5 }} className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full shadow-sm bg-white border border-slate-100">
                  <Image 
                    src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                    alt="ZiCash Logo" 
                    width={40} 
                    height={40} 
                    className="object-cover"
                  />
                </motion.div>
                <div className="flex flex-col justify-center">
                  <span className="font-bold text-base sm:text-lg text-slate-900 font-headline leading-none uppercase tracking-tight">
                    Zi<span className="text-blue-600">Cash GH</span>
                  </span>
                  <span className="hidden lg:block text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                    Premium Marketplace
                  </span>
                </div>
              </Link>
            </div>

            {/* Icons (Mobile Header) */}
            <div className="flex lg:hidden items-center gap-2">
              {!isAdminPath && (
                <Link href="/cart" className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              {session && (
                <Link href="/profile">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarImage src={profile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">
                      {session?.user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
              {!session && (
                <Link href="/auth">
                  <Button variant="outline" className="h-8 rounded-full text-[10px] font-bold px-3">Login</Button>
                </Link>
              )}
            </div>

            {/* Desktop Nav Links (Hidden on mobile) */}
            {!isAdminPath && (
              <div className="hidden lg:flex items-center gap-8 mx-12">
                {mainNavLinks.map((link) => (
                  <Link key={link.path} href={link.path} className="relative py-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em] transition-colors relative z-10", pathname === link.path ? "text-blue-600" : "text-slate-400 hover:text-slate-900")}>
                      {link.name}
                    </span>
                    {pathname === link.path && (
                      <motion.div layoutId="navActive" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search Row (Full Width on Mobile) */}
          <div className="w-full lg:flex-1 lg:max-w-sm relative group">
            {!isAdminPath && (
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="w-full h-10 sm:h-11 pl-11 pr-4 rounded-xl border border-blue-100 bg-slate-50 flex items-center cursor-pointer hover:bg-white hover:border-blue-300 transition-all duration-300 shadow-sm"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <span className={cn(
                  "text-xs font-bold truncate",
                  searchQuery ? "text-slate-900" : "text-slate-400"
                )}>
                  {searchQuery || "Search Marketplace..."}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-4 md:gap-6">
            {!isAdminPath && (
              <motion.div {...buttonTap}>
                <Link href="/cart" className="relative group p-2 transition-all duration-300">
                  <ShoppingCart className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black h-4 min-w-4 flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            )}

            {!session ? (
              <motion.div {...buttonTap} className="flex gap-2">
                <Link href="/auth">
                  <Button variant="ghost" className="font-bold text-slate-600 text-xs">Login</Button>
                </Link>
                <Link href="/auth">
                  <Button className="font-bold rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-10 text-xs">
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div {...buttonTap}>
                    <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm rounded-full overflow-hidden">
                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                          {session?.user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 border-blue-100 rounded-[1.5rem] p-2 shadow-2xl bg-white">
                  <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full">
                      <SettingsIcon className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-700 text-xs">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                    <Link href="/orders" className="flex items-center w-full">
                      <Package className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-700 text-xs">My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                    <Link href="/favorites" className="flex items-center w-full">
                      <Heart className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-700 text-xs">Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {secondaryLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                      <Link href={link.path} className="flex items-center w-full">
                        <link.icon className="mr-3 h-4 w-4 text-slate-400" />
                        <span className="font-bold text-slate-700 text-xs">{link.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-bold text-xs">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Full-Screen Search Mask Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-start justify-center pt-10 md:pt-20 px-4 overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md cursor-pointer" 
              onClick={() => setIsSearchOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-50 flex flex-col z-[1100]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-5 w-5 h-5 text-blue-600" />
                  <form onSubmit={handleSearchSubmit} className="flex-1">
                    <Input 
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Find items..." 
                      className="pl-14 pr-24 h-14 bg-blue-50/30 border-none rounded-full text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0 focus:bg-white transition-all"
                    />
                  </form>
                  
                  <div className="absolute right-2 flex items-center gap-1">
                    {searchQuery && (
                      <button onClick={clearQuery} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <Button 
                      onClick={handleSearchSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase text-[11px] tracking-widest px-8 h-10 shadow-lg shadow-blue-600/20"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2 bg-white">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-20" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Scanning Catalog...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="flex flex-col">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/product/${p.id}`);
                        }}
                        className="flex items-center justify-between px-10 py-5 hover:bg-blue-50 transition-colors group text-left border-b border-slate-50 last:border-0"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                           <Search className="w-4 h-4 text-blue-200 group-hover:text-blue-600 shrink-0" />
                           <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors truncate">
                             {p.name}
                           </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 1 ? (
                  <div className="p-16 text-center space-y-2">
                    <p className="text-sm font-black text-slate-400">No items matched "{searchQuery}"</p>
                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest italic">Try another term</p>
                  </div>
                ) : (
                  <div className="p-10 space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Shop By Department</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Laptops', 'Phones', 'Accessories', 'Closet'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setIsSearchOpen(false);
                              router.push('/categories');
                            }}
                            className="flex items-center justify-between px-8 py-5 bg-slate-50 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all group"
                          >
                            <span className="text-xs font-black uppercase tracking-widest italic">{cat}</span>
                            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}