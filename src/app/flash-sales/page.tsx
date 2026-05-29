"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Zap, RefreshCcw, Loader2, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FlashSalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHotDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))');

      if (!error && data) {
        // Filter for products that have at least one variant with a discount
        const discounted = data.filter(p => 
          p.variants?.some(v => v.discount && v.discount.discount_price > 0)
        );
        setProducts(discounted);
      }
    } catch (err) {
      console.error("Flash Sales Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotDeals();
  }, [fetchHotDeals]);

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />

      <main className="flex-1 pb-32 md:pb-12 text-slate-900">
        <div className="container mx-auto px-5 py-6 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <Link href="/">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors tracking-widest">
                  <ArrowLeft className="w-3 h-3" /> Back to Store
                </button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20">
                  <Zap className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black font-headline uppercase italic tracking-tighter">Flash <span className="text-red-600">Sales</span></h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-red-500 animate-pulse" /> Limited Time Exclusive Offers
                  </p>
                </div>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={fetchHotDeals}
              disabled={isLoading}
              className="h-12 rounded-2xl border-slate-100 bg-white font-black uppercase tracking-widest text-[10px] px-8 shadow-sm gap-2"
            >
              <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Update Offers
            </Button>
          </div>

          <ServiceHighlights />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin opacity-20" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing price drops...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <Zap className="w-12 h-12 text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-900 uppercase italic">No Active Flash Sales</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Check back soon for premium price drops.</p>
              <Link href="/products" className="mt-8">
                <Button className="bg-slate-900 text-white font-black rounded-2xl h-12 px-10 uppercase tracking-widest text-[10px]">Browse Catalog</Button>
              </Link>
            </div>
          )}

          <div className="pt-20">
             <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -mr-32 -mt-32" />
                <div className="space-y-2 relative z-10 text-center md:text-left">
                   <h3 className="text-2xl font-black uppercase italic font-headline">Never miss a <span className="text-red-500">Deal</span>.</h3>
                   <p className="text-slate-400 text-sm font-medium">Follow us on socials to get instant notifications of new flash sales.</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                   <Link href="/contact"><Button className="bg-red-600 hover:bg-red-700 font-black rounded-xl h-12 px-8 uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20">Contact Sales</Button></Link>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
