"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Package, RefreshCcw, Filter, X, ChevronRight, SlidersHorizontal, ArrowDownWideNarrow, Zap, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

/**
 * @fileOverview Marketplace Categories Page
 * Displays products by department with advanced filtering.
 */

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
  
  // Filter States
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
    { 
      id: "laptops",
      name: "Laptops", 
      imageUrl: "https://i.ibb.co/fGBPB9y4/laptop-586-removebg-preview.png",
    },
    { 
      id: "phones",
      name: "Phones", 
      imageUrl: "https://i.ibb.co/WvdsfcTh/Samsung-Galaxy-S24-Ultra-Titanium-Violet-Smartphone-transparent-PNG-image-300x300-removebg-preview.png",
    },
    { 
      id: "accessories",
      name: "Accessories", 
      imageUrl: "https://i.ibb.co/qFn4CMBf/hd-blue-apple-smart-watch-series-6-png-704081694622170ogfulucxw5-removebg-preview.png",
    },
    { 
      id: "closet",
      name: "Closet", 
      imageUrl: "https://i.ibb.co/MxNHbcw2/Armor-Hoodie-Black-01-removebg-preview.png",
    },
    { 
      id: "consult",
      name: "Educational Consult", 
      imageUrl: "https://i.ibb.co/pB4yX4JL/high-resolution-graduation-cap-png-icon-17-removebg-preview.png",
    },
  ], []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data || []);
      
      const prices = data.map((p: any) => p.price);
      const max = prices.length > 0 ? Math.max(...prices, 1000) : 20000;
      setMaxPriceLimit(max);
      setPriceRange([0, max]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products
      .filter(p => p.category === activeCategory)
      .forEach(p => { if (p.brand) brands.add(p.brand); });
    return Array.from(brands).sort();
  }, [products, activeCategory]);

  const activeProducts = useMemo(() => {
    let filtered = products.filter((p) => p.category === activeCategory);

    if (showHotDeals) {
      filtered = filtered.filter(p => 
        p.variants?.some(v => v.discount_price && v.discount_price > 0) || 
        (p.discount_price && p.discount_price > 0)
      );
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "oldest") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, activeCategory, showHotDeals, priceRange, selectedBrands, sortBy]);

  const resetFilters = () => {
    setPriceRange([0, maxPriceLimit]);
    setShowHotDeals(false);
    setSortBy("newest");
    setSelectedBrands([]);
  };

  const handleMinPriceChange = (val: string) => {
    const num = parseInt(val) || 0;
    setPriceRange([Math.min(num, priceRange[1]), priceRange[1]]);
  };

  const handleMaxPriceChange = (val: string) => {
    const num = parseInt(val) || 0;
    setPriceRange([priceRange[0], Math.max(num, priceRange[0])]);
  };

  const activeFilterCount = (selectedBrands.length > 0 ? 1 : 0) + 
    (showHotDeals ? 1 : 0) + 
    (priceRange[1] < maxPriceLimit || priceRange[0] > 0 ? 1 : 0);

  return (
    <main className="flex-1 flex overflow-hidden bg-slate-50">
      <aside className="w-24 md:w-32 bg-white border-r border-slate-100 flex flex-col overflow-y-auto scrollbar-hide shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.name); resetFilters(); }}
              className={cn(
                "relative py-6 px-2 flex flex-col items-center gap-2 transition-all group",
                isActive ? "bg-blue-50/30" : "bg-white hover:bg-slate-50/50"
              )}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
              
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center p-2 transition-all duration-300 group-active:scale-90",
                isActive ? "bg-white shadow-xl shadow-blue-500/10 scale-110" : "bg-slate-50 opacity-40 group-hover:opacity-100"
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic font-headline">{activeCategory}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeProducts.length} Items Available</p>
             </div>
             
             <div className="flex items-center gap-2">
               <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                     <Button variant="outline" className="rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase tracking-widest gap-2 h-10 shadow-sm relative">
                        <Filter className="w-3.5 h-3.5" /> 
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-lg">
                            {activeFilterCount}
                          </span>
                        )}
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
                           <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                              <ArrowDownWideNarrow className="w-3 h-3" /> Sort Items By
                           </label>
                           <Select value={sortBy} onValueChange={setSortBy}>
                              <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold shadow-inner text-xs">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-none shadow-2xl">
                                 <SelectItem value="newest" className="font-bold">Newest Arrivals</SelectItem>
                                 <SelectItem value="price_asc" className="font-bold">Price: Low to High</SelectItem>
                                 <SelectItem value="price_desc" className="font-bold">Price: High to Low</SelectItem>
                                 <SelectItem value="oldest" className="font-bold">Oldest Items</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Price Limit</label>
                              <span className="text-[10px] font-black text-blue-600 italic">GHS {priceRange[0]} — {priceRange[1]}</span>
                           </div>
                           
                           <div className="flex gap-4 items-center">
                             <div className="flex-1 space-y-1">
                               <label className="text-[9px] font-black uppercase text-slate-300 ml-1">Min Price</label>
                               <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600">GHS</span>
                                  <Input 
                                    type="number" 
                                    className="h-11 pl-11 rounded-xl bg-slate-50 border-none font-bold text-xs shadow-inner" 
                                    value={priceRange[0]} 
                                    onChange={(e) => handleMinPriceChange(e.target.value)}
                                  />
                               </div>
                             </div>
                             <div className="flex-1 space-y-1">
                               <label className="text-[9px] font-black uppercase text-slate-300 ml-1">Max Price</label>
                               <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600">GHS</span>
                                  <Input 
                                    type="number" 
                                    className="h-11 pl-11 rounded-xl bg-slate-50 border-none font-bold text-xs shadow-inner" 
                                    value={priceRange[1]} 
                                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                                  />
                               </div>
                             </div>
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

                        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 shadow-sm group">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform"><Zap className="w-5 h-5 fill-current" /></div>
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-xs">Hot Deals Only</p>
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Show discounted products</p>
                              </div>
                           </div>
                           <Checkbox checked={showHotDeals} onCheckedChange={(val) => setShowHotDeals(val as boolean)} className="w-6 h-6 rounded-lg data-[state=checked]:bg-blue-600" />
                        </div>

                        {availableBrands.length > 0 && (
                          <div className="space-y-4">
                             <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Available Brands</label>
                             <div className="grid grid-cols-2 gap-3">
                                {availableBrands.map(brand => (
                                  <button 
                                    key={brand}
                                    onClick={() => {
                                      setSelectedBrands(prev => 
                                        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                                      );
                                    }}
                                    className={cn(
                                      "flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                      selectedBrands.includes(brand) ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                                    )}
                                  >
                                     {brand}
                                     {selectedBrands.includes(brand) && <X className="w-3 h-3" />}
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>

                     <SheetFooter className="p-8 border-t border-slate-50 flex flex-row gap-3">
                        <Button variant="ghost" onClick={resetFilters} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest">Clear All</Button>
                        <SheetClose asChild>
                          <Button className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20">Apply Results</Button>
                        </SheetClose>
                     </SheetFooter>
                  </SheetContent>
               </Sheet>

               <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchProducts} 
                disabled={isLoading}
                className="rounded-xl h-10 w-10 text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
               >
                 <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
               </Button>
             </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
               {showHotDeals && (
                 <Badge className="bg-blue-600 text-white border-none py-1.5 px-3 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center gap-2">
                    Hot Deals <button onClick={() => setShowHotDeals(false)}><X className="w-3 h-3" /></button>
                 </Badge>
               )}
               {(priceRange[0] > 0 || priceRange[1] < maxPriceLimit) && (
                 <Badge className="bg-slate-900 text-white border-none py-1.5 px-3 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center gap-2">
                    GHS {priceRange[0]} - {priceRange[1]} <button onClick={() => setPriceRange([0, maxPriceLimit])}><X className="w-3 h-3" /></button>
                 </Badge>
               )}
               {selectedBrands.map(brand => (
                 <Badge key={brand} className="bg-white text-slate-900 border border-slate-200 py-1.5 px-3 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center gap-2">
                    {brand} <button onClick={() => setSelectedBrands(prev => prev.filter(b => b !== brand))}><X className="w-3 h-3" /></button>
                 </Badge>
               ))}
               <button onClick={resetFilters} className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1 hover:underline underline-offset-4">Reset All</button>
            </div>
          )}

          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <ItemLoadingView key={i} />
              ))}
            </div>
          ) : activeProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 animate-in fade-in duration-500">
              {activeProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  showCategory={false} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-slate-200" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic">No Products Found</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 text-center max-w-xs px-6">Try adjusting your filters or checking another section.</p>
              <Button onClick={resetFilters} className="mt-8 bg-blue-600 text-white font-black rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20">Clear All Filters</Button>
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
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-20" />
        </main>
      }>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
