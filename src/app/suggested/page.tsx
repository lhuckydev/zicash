"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
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
    return [...products].sort(() => Math.random() - 0.5);
  }, [products, seed]);

  const refreshDeals = () => {
    setSeed(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />

      <main className="flex-1 pb-32 md:pb-12 text-slate-900">
        <div className="container mx-auto px-5 py-6 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <Link href="/">
                <Button variant="ghost" className="p-0 h-auto font-bold text-slate-400 hover:text-blue-600 hover:bg-transparent uppercase text-[10px] tracking-widest mb-1">
                  <ArrowLeft className="w-3 h-3 mr-2" /> Storefront
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold font-headline leading-tight italic uppercase">Suggested <span className="text-blue-600">Deals</span></h1>
              </div>
            </div>

            <Button 
              onClick={refreshDeals}
              className="h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold uppercase tracking-widest text-[10px] px-6 shadow-sm hover:bg-slate-50 gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Rescan Catalog
            </Button>
          </div>

          <ServiceHighlights />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-20" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {shuffledDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-100">
              <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting digital procurement sync...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
