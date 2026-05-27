
"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Sparkles, RefreshCcw, Loader2, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SuggestedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))');

      if (!error) setProducts(data || []);
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const shuffledDeals = useMemo(() => {
    if (products.length === 0) return [];
    // Randomize based on current seed
    return [...products].sort(() => Math.random() - 0.5);
  }, [products, seed]);

  const refreshDeals = () => {
    setSeed(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />

      <main className="flex-1 pb-32 md:pb-12 text-slate-900">
        <div className="container mx-auto px-5 py-10 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link href="/">
                <Button variant="ghost" className="p-0 h-auto font-bold text-slate-400 hover:text-blue-600 hover:bg-transparent uppercase text-[10px] tracking-widest mb-2">
                  <ArrowLeft className="w-3 h-3 mr-2" /> Back to Store
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
                  Suggested <span className="text-blue-600 italic">Deals</span>
                </h1>
              </div>
              <p className="text-slate-500 font-medium max-w-xl">
                Our algorithm has hand-picked these high-performance items just for you. Prices valid while stock lasts.
              </p>
            </div>

            <Button 
              onClick={refreshDeals}
              className="h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold uppercase tracking-widest text-[10px] px-8 shadow-sm hover:bg-slate-50 gap-3"
            >
              <RefreshCcw className="w-4 h-4" /> Refresh Suggestions
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin opacity-20" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Best Deals...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {shuffledDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-32 bg-blue-100/20 rounded-[3rem] border border-dashed border-blue-200">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Awaiting procurement sync...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
