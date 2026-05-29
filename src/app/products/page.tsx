"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Package, RefreshCcw, Filter, X, Search, SlidersHorizontal, Zap, Loader2 } from "lucide-react";
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

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(20000);
  const [showHotDeals, setShowHotDeals] = useState(false);
  const [sortBy, setSortBy] = useState("shuffle");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, variants:product_variants(*, discount:discounts(*))`);

      if (error) throw error;
      
      // Random mix logic
      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      setProducts(shuffled);
      
      const prices = (data || []).map((p: any) => p.price);
      const max = prices.length > 0 ? Math.max(...prices, 1000) : 20000;
      setMaxPriceLimit(max);
      setPriceRange([0, max]);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showHotDeals) {
      result = result.filter(p => p.variants?.some(v => !!v.discount));
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sortBy === "price_asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return result;
  }, [products, searchQuery, showHotDeals, priceRange, sortBy]);

  const resetFilters = () => {
    setPriceRange([0, maxPriceLimit]);
    setShowHotDeals(false);
    setSortBy("shuffle");
    setSearchQuery("");
  };

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 italic font-headline">
              All <span className="text-blue-600">Hardware</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curated high-performance inventory</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search catalog..." 
                className="h-12 pl-12 rounded-2xl bg-white border-none shadow-sm font-bold text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 rounded-2xl border-none bg-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm px-6">
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[85vw] sm:max-w-md rounded-l-[2rem] border-none bg-white p-0 flex flex-col">
                <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                  <SheetTitle className="text-xl font-black uppercase italic font-headline flex items-center gap-3 text-slate-900">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" /> Refine <span className="text-blue-600">Search</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sorting Core</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-inner"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="shuffle" className="font-bold">Randomized Mix</SelectItem>
                        <SelectItem value="newest" className="font-bold">Newest Arrivals</SelectItem>
                        <SelectItem value="price_asc" className="font-bold">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc" className="font-bold">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Price Threshold</label>
                      <span className="text-[10px] font-black text-blue-600 italic">GHS {priceRange[0]} — {priceRange[1]}</span>
                    </div>
                    <Slider 
                      defaultValue={[0, maxPriceLimit]} 
                      max={maxPriceLimit} 
                      step={100} 
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={(val) => setPriceRange(val as [number, number])}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform"><Zap className="w-5 h-5 fill-current" /></div>
                      <div>
                        <p className="font-black text-slate-900 uppercase text-xs">Flash Sale Only</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Display discounted units</p>
                      </div>
                    </div>
                    <Checkbox checked={showHotDeals} onCheckedChange={(val) => setShowHotDeals(val as boolean)} className="w-6 h-6 rounded-lg border-blue-200" />
                  </div>
                </div>
                <SheetFooter className="p-8 border-t border-slate-50 flex gap-3">
                  <Button variant="ghost" onClick={resetFilters} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Reset</Button>
                  <SheetClose asChild>
                    <Button className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl">Apply Results</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ItemLoadingView key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-700">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No hardware matching your criteria.</p>
            <Button onClick={resetFilters} className="mt-8 bg-blue-600 text-white font-black rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest">Clear All Filters</Button>
          </div>
        )}

        <div className="pt-20">
           <ServiceHighlights />
        </div>
      </div>
    </main>
  );
}

export default function AllProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<main className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-20" /></main>}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
