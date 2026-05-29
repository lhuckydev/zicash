"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { HotDeals } from "@/components/home/HotDeals";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { Product } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { 
  Laptop, Smartphone, Shirt, GraduationCap, Zap, 
  LayoutGrid, Sparkles, RefreshCcw, ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { slideUp, fadeIn, staggerContainer, buttonTap } from "@/lib/animations";

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-4 space-y-4 border border-transparent">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export default function CatalogPage() {
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setProducts(data || []);
    } catch (err: any) {
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .order('created_at', { ascending: false });
      
      if (fallbackData) {
        setProducts(fallbackData);
      } else {
        setError("Catalog connection temporary interrupted.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = [
    { name: "All", icon: LayoutGrid },
    { name: "Laptops", imageUrl: "https://i.ibb.co/fGBPB9y4/laptop-586-removebg-preview.png", icon: Laptop },
    { name: "Phones", imageUrl: "https://i.ibb.co/WvdsfcTh/Samsung-Galaxy-S24-Ultra-Titanium-Violet-Smartphone-transparent-PNG-image-300x300-removebg-preview.png", icon: Smartphone },
    { name: "Accessories", imageUrl: "https://i.ibb.co/qFn4CMBf/hd-blue-apple-smart-watch-series-6-png-704081694622170ogfulucxw5-removebg-preview.png", icon: Zap },
    { name: "Closet", imageUrl: "https://i.ibb.co/MxNHbcw2/Armor-Hoodie-Black-01-removebg-preview.png", icon: Shirt },
    { name: "Educational Consult", imageUrl: "https://i.ibb.co/pB4yX4JL/high-resolution-graduation-cap-png-icon-17-removebg-preview.png", icon: GraduationCap },
  ];

  const filteredProducts = useMemo(() => {
    const items = products.filter((p) => category === "All" || p.category === category);
    return items.slice(0, 6); // Limit to 6 products
  }, [products, category]);

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />

      <main className="flex-1 pb-24 md:pb-12 text-slate-900">
        <div className="container mx-auto space-y-4">
          
          {category === "All" && <HeroSlider />}

          <div className="px-5 space-y-6">
            
            <ServiceHighlights />

            {!error && (
              <motion.div variants={staggerContainer(0.05)} initial="initial" animate="animate" className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <motion.h2 variants={slideUp} className="text-lg font-black font-headline text-slate-900 uppercase tracking-tight italic">Departments</motion.h2>
                  <Link href="/categories">
                    <motion.button variants={fadeIn} className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Browse All</motion.button>
                  </Link>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((cat) => (
                    <motion.button key={cat.name} variants={slideUp} {...buttonTap} onClick={() => setCategory(cat.name)} className="flex flex-col items-center gap-2 shrink-0 group">
                      <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden border p-3.5",
                        category === cat.name ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 border-blue-600" : "bg-white text-slate-400 border-slate-100"
                      )}>
                        {cat.imageUrl ? (
                          <div className="relative w-full h-full"><Image src={cat.imageUrl} alt={cat.name} fill className="object-contain" /></div>
                        ) : (
                          <cat.icon className={cn("w-6 h-6", category === cat.name ? "text-white" : "text-slate-400")} />
                        )}
                      </div>
                      <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", category === cat.name ? "text-blue-600" : "text-slate-400")}>{cat.name.split(' ')[0]}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {category === "All" && <HotDeals />}

            <div id="marketplace" className="scroll-mt-24 space-y-6">
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-4">
                    <h3 className="text-base md:text-xl font-black font-headline text-slate-900 uppercase tracking-tight italic">{category === "All" ? "OUR ITEMS" : `${category}`}</h3>
                    <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={isLoading} className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600">
                      <RefreshCcw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                    </Button>
                  </div>
                </div>

                {isLoading && products.length === 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <>
                    <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredProducts.map((product) => (
                        <motion.div key={product.id} variants={fadeIn}>
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    <div className="pt-8 flex justify-center">
                      <Link href="/products">
                        <Button className="h-14 px-10 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] rounded-2xl gap-3 shadow-xl shadow-blue-600/5 group">
                          View All Hardware <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory empty in this segment</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
