
"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/lib/animations";

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
          // Identify products with active discounts in the specialized table
          const discounted = data.filter(p => 
            p.variants?.some(v => !!v.discount)
          ).slice(0, 5);
          
          setProducts(discounted);
        }
      } catch (err) {
        console.warn("Hot Deals fetch fallback active:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHotDeals();
  }, []);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Zap className="w-3 h-3 fill-current" /> Exclusive Offers
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline uppercase italic">Hot <span className="text-red-600">Deals</span></h2>
            <p className="text-slate-500 font-medium max-w-xl">
              Limited-time discounts on our premium configurations. Grab yours before the sale ends.
            </p>
          </div>
          
          <Link href="/categories?filter=discounted">
            <Button className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all hover:scale-105">
              View All Offers <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin opacity-20" />
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer(0.1)} 
            initial="initial" 
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeIn}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
