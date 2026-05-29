
"use client";

import { useEffect, useState } from "react";
import { Product } from "@/store/useCartStore";
import Link from "next/link";
import { Zap, ChevronRight, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

const CountdownTimer = () => {
  const [time, setTime] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Target end of day for demo, or a specific promo end
      const target = new Date();
      target.setHours(23, 59, 59);
      
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      
      setTime({ h, m, s });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-white font-bold text-[10px] md:text-sm">
      <span className="opacity-80 font-medium">Time Left:</span>
      <span className="bg-white/20 px-1.5 py-0.5 rounded tabular-nums">{time.h}h</span>
      <span>:</span>
      <span className="bg-white/20 px-1.5 py-0.5 rounded tabular-nums">{time.m}m</span>
      <span>:</span>
      <span className="bg-white/20 px-1.5 py-0.5 rounded tabular-nums">{time.s}s</span>
    </div>
  );
};

function FlashSaleCard({ product }: { product: Product }) {
  const variant = product.variants?.[0];
  const discount = variant?.discount;
  const currentPrice = discount?.discount_price || variant?.price || product.price;
  const originalPrice = variant?.price || product.price;
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  
  // Simulated stock for the UI progress bar (48/50 items left style)
  const totalStock = 50;
  const currentStock = variant?.stock || 0;
  const stockDisplay = Math.min(currentStock, 49); // Just for the "items left" visual feel
  const progressWidth = (stockDisplay / totalStock) * 100;

  return (
    <Link href={`/product/${product.id}`} className="block shrink-0 w-[140px] md:w-[180px] group">
      <div className="bg-white rounded-xl p-2 space-y-2">
        <div className="relative aspect-square rounded-lg bg-slate-50 overflow-hidden">
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill 
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
          />
          {discountPercent > 0 && (
            <div className="absolute top-1 right-1 bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-orange-100">
              -{discountPercent}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h4 className="text-[10px] md:text-xs font-medium text-slate-600 line-clamp-1 truncate uppercase">
            {product.name}
          </h4>
          <div className="space-y-0">
            <p className="text-xs md:text-base font-black text-slate-900 leading-none">
              GH₵ {currentPrice.toLocaleString()}
            </p>
            {originalPrice > currentPrice && (
              <p className="text-[8px] md:text-[10px] text-slate-400 line-through font-bold">
                GH₵ {originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="pt-1 space-y-1">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
              {stockDisplay} items left
            </p>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressWidth}%` }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HotDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHotDeals() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, variants:product_variants(*, discount:discounts(*))')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const discounted = data.filter(p => 
            p.variants?.some(v => !!v.discount)
          ).slice(0, 5);
          setProducts(discounted);
        }
      } catch (err) {
        console.warn("Hot Deals sync error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHotDeals();
  }, []);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="px-1 md:px-0">
      <div className="bg-[#D31C31] rounded-2xl overflow-hidden shadow-xl shadow-red-900/10 border-2 border-[#D31C31]">
        {/* Header */}
        <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
               <Zap className="w-5 h-5 text-red-700 fill-current" />
             </div>
             <h2 className="text-white font-black text-sm md:text-xl uppercase italic tracking-tight font-headline">Flash Sales</h2>
          </div>
          
          <CountdownTimer />
          
          <Link href="/categories?filter=discounted" className="hidden md:flex items-center gap-1 text-white/90 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            See All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Scroller */}
        <div className="bg-white p-3 md:p-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin opacity-20" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {products.map((p) => (
                <FlashSaleCard key={p.id} product={p} />
              ))}
              
              <Link href="/categories?filter=discounted" className="shrink-0 w-24 md:w-32 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border-2 border-dashed border-slate-200">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <ChevronRight className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">More Deals</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile-only See All link below scroller if preferred, or keep in header */}
      <div className="mt-3 flex justify-end md:hidden px-2">
        <Link href="/categories?filter=discounted" className="flex items-center gap-1 text-red-600 text-[10px] font-black uppercase tracking-widest">
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
