"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, Product } from "@/store/useCartStore";
import { ShoppingCart, Heart, Settings as SettingsIcon, Package, Menu, Search, LogOut, LayoutGrid, Zap, BrainCircuit, Info, Phone, Gavel, X, Loader2 } from "lucide-react";
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

  // Intelligent Indexing Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        // Intelligent Indexing: Filter by name, category, and brand
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
          .limit(6);
        
        if (!error && data) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Search index error", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

  const mainNavLinks = [
    { name: "Shop", path: "/", icon: LayoutGrid },
    { name: "Departments", path: "/categories", icon: Zap },
    { name: "AI Advisor", path: "/advisor", icon: BrainCircuit },
  ];

  const secondaryLinks = [
    { name: "Our Vision", path: "/about", icon: Info },
    { name: "Support Center", path: "/contact", icon: Phone },
    { name: "Market Policy", path: "/terms", icon: Gavel },
  ];

  const allMobileLinks = [...mainNavLinks, ...secondaryLinks];

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {!isAdminPath && (
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-500 h-9 w-9">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 border-none rounded-r-[2rem] shadow-2xl">
                  <SheetHeader className="p-8 border-b border-slate-50 text-left bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 overflow-hidden rounded-full shadow-md border border-white bg-white shrink-0">
                        <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={40} height={40} className="object-cover" />
                      </div>
                      <SheetTitle className="text-left">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black font-headline tracking-tighter text-slate-900 leading-none">
                            Zi<span className="text-blue-600">Cash</span>
                          </span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                            GH Limited
                          </span>
                        </div>
                      </SheetTitle>
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

          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.div whileHover={{ rotate: 5 }} className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full shadow-sm bg-white border border-slate-100">
              <Image 
                src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                alt="ZiCash Logo" 
                width={40} 
                height={40} 
                className="object-cover"
              />
            </motion.div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="font-bold text-lg text-slate-900 font-headline leading-none">
                Zi<span className="text-blue-600">Cash</span>
              </span>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                GH Limited
              </span>
            </div>
          </Link>
        </div>

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

        <div className="flex-1 max-w-sm mx-2 sm:mx-4 relative group">
          {!isAdminPath && (
            <div className="relative w-full">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-blue-100 bg-slate-50/50 flex items-center cursor-pointer hover:bg-white hover:border-blue-300 transition-all duration-300 group shadow-sm"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span className="text-slate-400 text-xs font-bold truncate">Search for items...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-4 md:gap-6">
          {!isAdminPath && (
            <motion.div {...buttonTap}>
              <Link href="/cart" className="relative group p-2 transition-all duration-300">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] sm:text-[9px] font-black h-4 min-w-4 flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            </motion.div>
          )}

          {!session ? (
            <div className="flex items-center gap-1 sm:gap-3">
              <Link href="/auth" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-slate-600 p-0 hover:bg-transparent text-xs">Login</Button>
              </Link>
              <motion.div {...buttonTap}>
                <Link href="/auth">
                  <Button className="font-bold rounded-full px-3 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-8 sm:h-10 text-[10px] sm:text-xs">
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div {...buttonTap}>
                  <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-white shadow-sm rounded-full overflow-hidden">
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
                <DropdownMenuLabel className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3 py-2">Info</DropdownMenuLabel>
                
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

      {/* Full Screen Mask Search Experience */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col pt-4 sm:pt-0"
          >
            <div className="container mx-auto px-6 flex flex-col h-full">
              <div className="flex items-center gap-4 py-6 border-b border-blue-50 shrink-0">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600" />
                  <form onSubmit={handleSearchSubmit}>
                    <Input 
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="What are you looking for?" 
                      className="pl-12 h-14 bg-slate-50 border-none rounded-2xl text-lg font-bold placeholder:text-slate-300 focus-visible:ring-4 focus-visible:ring-blue-600/5 transition-all"
                    />
                  </form>
                </div>
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                  className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 space-y-10 scrollbar-hide">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin opacity-20" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching our inventory...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Store Suggestions</p>
                      <button onClick={handleSearchSubmit} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View all results</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestions.map((p) => (
                        <Link 
                          key={p.id} 
                          href={`/product/${p.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-5 p-5 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/5 transition-all group"
                        >
                          <div className="relative w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0 shadow-inner flex items-center justify-center">
                            <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate uppercase group-hover:text-blue-600 transition-colors">{p.name}</p>
                            <p className="text-sm font-bold text-blue-600 italic mt-1">GH₵{p.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded shadow-sm">Verified Unit</span>
                               <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">{p.category}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 uppercase">No matching items</h3>
                    <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">We couldn't find any items matching your current search. Try checking your spelling or using more general terms.</p>
                  </div>
                ) : (
                  <div className="space-y-12 animate-in fade-in duration-700">
                     <div className="space-y-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Market Departments</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                           {['Laptops', 'Phones', 'Accessories', 'Closet'].map((cat) => (
                             <Link 
                               key={cat} 
                               href={`/categories`} 
                               onClick={() => setIsSearchOpen(false)}
                               className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-blue-600 hover:text-white transition-all text-center group shadow-sm hover:shadow-xl hover:shadow-blue-600/10"
                             >
                               <span className="text-xs font-black uppercase tracking-widest italic">{cat}</span>
                             </Link>
                           ))}
                        </div>
                     </div>

                     <div className="p-10 rounded-[3rem] bg-blue-50/50 border border-blue-100 text-center space-y-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-black uppercase italic text-slate-900">Need expert advice?</h4>
                        <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">Our AI Advisor can help you pick the perfect hardware based on your needs and budget.</p>
                        <Link href="/advisor" onClick={() => setIsSearchOpen(false)}>
                          <Button className="bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest text-[10px] rounded-xl px-8 h-12 mt-4 shadow-lg shadow-blue-600/20">Talk to Advisor</Button>
                        </Link>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
