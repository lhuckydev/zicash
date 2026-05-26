"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, Product } from "@/store/useCartStore";
import { ShoppingCart, User, Search, LogOut, Heart, Settings as SettingsIcon, Package, Menu, X, ShieldCheck, Info, Phone, Gavel, LayoutGrid, Zap, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

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
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const mainNavLinks = [
    { name: "Shop", path: "/", icon: LayoutGrid },
    { name: "Categories", path: "/categories", icon: Zap },
    { name: "AI Advisor", path: "/advisor", icon: BrainCircuit },
  ];

  const secondaryLinks = [
    { name: "About Us", path: "/about", icon: Info },
    { name: "Contact & Support", path: "/contact", icon: Phone },
    { name: "Terms & Conditions", path: "/terms", icon: Gavel },
  ];

  const allMobileLinks = [...mainNavLinks, ...secondaryLinks];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 overflow-hidden">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isAdminPath && (
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-500">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 border-none rounded-r-[2rem]">
                  <SheetHeader className="p-8 border-b border-slate-50 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center p-2">
                        <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={40} height={40} className="rounded-full object-cover" />
                      </div>
                      <SheetTitle className="text-left">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold font-headline leading-none text-slate-900">
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
                    {allMobileLinks.map((link) => (
                      <Link 
                        key={link.path} 
                        href={link.path} 
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm group",
                          pathname === link.path ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <link.icon className={cn("w-5 h-5", pathname === link.path ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600")} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-full shadow-sm bg-white border border-slate-100">
              <Image 
                src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                alt="ZiCash Logo" 
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-sm sm:text-lg text-slate-900 font-headline leading-none">
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
              <Link key={link.path} href={link.path} className={cn("text-[10px] font-bold uppercase tracking-[0.15em] transition-colors", pathname === link.path ? "text-blue-600" : "text-slate-400 hover:text-slate-900")}>
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {!isAdminPath && (
          <div className="hidden md:flex flex-1 max-w-sm mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full border-blue-100 bg-white/50 focus-visible:ring-blue-600/20"
              />
            </form>
          </div>
        )}

        <div className="flex items-center gap-4 md:gap-6">
          {!isAdminPath && (
            <Link href="/cart" className="relative group p-2 transition-all duration-300">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black h-4 min-w-4 flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
          )}

          {!session ? (
            <div className="flex items-center gap-3">
              <Link href="/auth" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-slate-600 p-0 hover:bg-transparent text-xs">Login</Button>
              </Link>
              <Link href="/auth">
                <Button className="font-bold rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-10 text-xs">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm rounded-full overflow-hidden">
                    <AvatarImage src={profile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                      {session?.user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 border-blue-100 rounded-[1.5rem] p-2 shadow-2xl bg-white">
                <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                  <Link href="/profile" className="flex items-center w-full">
                    <SettingsIcon className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="font-bold text-slate-700 text-xs">Profile Settings</span>
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
                <DropdownMenuLabel className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3 py-2">Information</DropdownMenuLabel>
                
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
    </nav>
  );
}
