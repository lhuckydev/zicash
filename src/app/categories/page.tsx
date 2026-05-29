"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Package, RefreshCcw, Filter, X, ChevronRight, SlidersHorizontal, Zap, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

function ItemLoadingView() {
  return (
    <div className="bg-white rounded-3xl p-4 space-y-4 border border-slate-50">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Laptops");
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(20000);
  const [showHotDeals, setShowHotDeals] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (initialFilter === 'discounted') {
      setShowHotDeals(true);
    }
  }, [initialFilter]);

  const categories = useMemo(() => [
    { id: "laptops", name: "Laptops", imageUrl: "https://i.ibb.co/fGBPB9y4/laptop-586-removebg-preview.png" },
    { id: "phones", name: "Phones", imageUrl: "https://i.ibb.co/WvdsfcTh/Samsung-Galaxy-S24-Ultra-Titanium-Violet-Smartphone-transparent-PNG-image-300x300-removebg-preview.png" },
    { id: "accessories", name: "Accessories", imageUrl: "https://i.ibb.co/qFn4CMBf/hd-blue-apple-smart-watch-series-6-png-704081694622170ogfulucxw5-removebg-preview.png" },
    { id: "closet", name: "Closet", imageUrl: "https://i.ibb.co/MxNHbcw2/Armor-Hoodie-Black-01-removebg-preview.png" },
    { id: "consult", name: "Educational Consult", imageUrl: "https://i.ibb.co/pB4yX4JL/high-resolution-graduation-cap-png-icon-17-removebg-preview.png" },
  ], []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, variants:product_variants(*, discount:discounts(*))`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      
      const prices = (data || []).map((p: any) => p.price);
      const max = prices.length > 0 ? Math.max(...prices, 1000) : 20000;
      setMaxPriceLimit(max);
      setPriceRange([0, max]);
    } catch (err: any) {
      const { data } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const activeProducts = useMemo(() => {
    let filtered = products.filter((p) => p.category === activeCategory);
    if (showHotDeals) {
      filtered = filtered.filter(p => p.variants?.some(v => !!v.discount));
    }
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, activeCategory, showHotDeals, priceRange, selectedBrands, sortBy]);

  const resetFilters = () => {
    setPriceRange([0, maxPriceLimit]);
    setShowHotDeals(false);
    setSortBy("newest");
    setSelectedBrands([]);
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
      <aside className="w-full md:w-32 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto scrollbar-hide shrink-0 z-20 shadow-sm">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.name); resetFilters(); }}
              className={cn(
                "relative py-4 md:py-6 px-4 md:px-2 flex flex-row md:flex-col items-center gap-2 md:gap-2 transition-all group shrink-0",
                isActive ? "bg-blue-50/30" : "bg-white hover:bg-slate-50/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center p-1.5 md:p-2 transition-all duration-300",
                isActive ? "bg-white shadow-lg scale-110" : "bg-slate-50 opacity-40 group-hover:opacity-100"
              )}>
                <div className="relative w-full h-full">
                  <Image src={cat.imageUrl} alt={cat.name} fill className="object-contain" />
                </div>
              </div>
              <span className={cn(
                "text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-center leading-tight transition-colors",
                isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {cat.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </aside>

      <section className="flex-1 overflow-y-auto scrollbar-hide pb-24 md:pb-12">
        <div className="p-4 md:p-8 space-y-6">
          
          <ServiceHighlights />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic font-headline">{activeCategory}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeProducts.length} Items Available</p>
             </div>
             <div className="flex items-center gap-2">
               <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                     <Button variant="outline" className="rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase tracking-widest gap-2 h-10 shadow-sm relative">
                        <Filter className="w-3.5 h-3.5" /> Filters
                     </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[85vw] sm:max-w-md rounded-l-[2rem] border-none bg-white p-0 overflow-hidden flex flex-col">
                     <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                        <SheetTitle className="text-xl font-black uppercase italic font-headline flex items-center gap-3">
                           <SlidersHorizontal className="w-5 h-5 text-blue-600" /> Catalog <span className="text-blue-600">Filters</span>
                        </SheetTitle>
                     </SheetHeader>
                     <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                        <div className="space-y-4">
                           <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">Sort By</label>
                           <Select value={sortBy} onValueChange={setSortBy}>
                              <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold shadow-inner text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-2xl border-none shadow-2xl">
                                 <SelectItem value="newest" className="font-bold">Newest Arrivals</SelectItem>
                                 <SelectItem value="price_asc" className="font-bold">Price: Low to High</SelectItem>
                                 <SelectItem value="price_desc" className="font-bold">Price: High to Low</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Price Limit</label>
                              <span className="text-[10px] font-black text-blue-600 italic">GHS {priceRange[0]} — {priceRange[1]}</span>
                           </div>
                           <Slider 
                              defaultValue={[0, maxPriceLimit]} 
                              max={maxPriceLimit} 
                              step={100} 
                              value={[priceRange[0], priceRange[1]]}
                              onValueChange={(val) => setPriceRange(val as [number, number])}
                              className="py-4"
                           />
                        </div>
                        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 group">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform"><Zap className="w-5 h-5 fill-current" /></div>
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-xs">Hot Deals Only</p>
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Show discounted products</p>
                              </div>
                           </div>
                           <Checkbox checked={showHotDeals} onCheckedChange={(val) => setShowHotDeals(val as boolean)} className="w-6 h-6 rounded-lg data-[state=checked]:bg-blue-600" />
                        </div>
                     </div>
                     <SheetFooter className="p-8 border-t border-slate-50 flex flex-row gap-3">
                        <Button variant="ghost" onClick={resetFilters} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest">Clear All</Button>
                        <SheetClose asChild>
                          <Button className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl">Apply Results</Button>
                        </SheetClose>
                     </SheetFooter>
                  </SheetContent>
               </Sheet>
               <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={isLoading} className="rounded-xl h-10 w-10 text-slate-300 hover:text-blue-600"><RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} /></Button>
             </div>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ItemLoadingView key={i} />)}
            </div>
          ) : activeProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
              {activeProducts.map((product) => <ProductCard key={product.id} product={product} showCategory={false} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <Package className="w-10 h-10 text-slate-200 mb-6" />
              <h2 className="text-xl font-black text-slate-900 uppercase italic">No Products Found</h2>
              <Button onClick={resetFilters} className="mt-8 bg-blue-600 text-white font-black rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest shadow-xl">Clear All Filters</Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function CategoriesPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <Suspense fallback={<main className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-20" /></main>}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
