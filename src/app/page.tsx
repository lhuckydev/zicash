
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { HotDeals } from "@/components/home/HotDeals";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Product } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { 
  Laptop, Smartphone, Shirt, GraduationCap, Zap, 
  LayoutGrid, Sparkles, ArrowRight, AlertCircle, RefreshCcw
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

function SuggestedProductTile({ product }: { product: Product }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }} 
      className="h-full px-1 py-3"
    >
      <Link href={`/product/${product.id}`} className="flex flex-col items-center group h-full">
        <div className="relative aspect-square w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white mb-3 shadow-lg border border-slate-50 group-hover:shadow-xl transition-all">
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill 
            className="object-contain p-3 md:p-5 transition-transform duration-500 group-hover:scale-105" 
            sizes="(max-width: 768px) 40vw, 20vw"
          />
        </div>
        <div className="space-y-1 text-center w-full px-1">
          <h4 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h4>
          <p className="text-[11px] md:text-xs font-black text-blue-600 italic">GH₵ {product.price.toLocaleString()}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CatalogPage() {
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);

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
      setSeed(Math.random());
    } catch (err: any) {
      console.warn("Primary fetch failed, using safe fallback:", err.message);
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .order('created_at', { ascending: false });
      
      if (fallbackData) {
        setProducts(fallbackData);
        setSeed(Math.random());
      } else {
        setError("Catalog connection temporary interrupted. Refresh to retry.");
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

  const filteredProducts = useMemo(() => products.filter((p) => category === "All" || p.category === category), [products, category]);
  
  const suggestedPicks = useMemo(() => {
    if (products.length === 0) return [];
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [products, seed]);

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />

      <main className="flex-1 pb-24 md:pb-12 text-slate-900">
        <div className="container mx-auto space-y-6">
          
          {/* Customizable Promotional Slideshow */}
          {category === "All" && <HeroSlider />}

          <div className="px-5 space-y-6">
            
            {/* 1. Category Quick Links (Now right after slideshow) */}
            {!error && (
              <motion.div variants={staggerContainer(0.05)} initial="initial" animate="animate" className="space-y-4">
                <div className="flex items-center justify-between">
                  <motion.h2 variants={slideUp} className="text-xl font-black font-headline text-slate-900 uppercase tracking-tight italic">Product Categories</motion.h2>
                  <Link href="/categories">
                    <motion.button variants={fadeIn} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:opacity-70">Browse All</motion.button>
                  </Link>
                </div>
                <div className="flex gap-6 overflow-x-auto md:justify-center pb-2 scrollbar-hide px-2">
                  {categories.map((cat) => (
                    <motion.button key={cat.name} variants={slideUp} {...buttonTap} onClick={() => setCategory(cat.name)} className="flex flex-col items-center gap-3 shrink-0 group">
                      <div className={cn(
                        "w-16 h-16 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden border p-4",
                        category === cat.name ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 border-blue-600" : "bg-white text-slate-400 border-slate-100 hover:border-blue-200"
                      )}>
                        {cat.imageUrl ? (
                          <div className="relative w-full h-full"><Image src={cat.imageUrl} alt={cat.name} fill className="object-contain" /></div>
                        ) : (
                          <cat.icon className={cn("w-6 h-6 md:w-8 md:h-8", category === cat.name ? "text-white" : "text-slate-400")} />
                        )}
                      </div>
                      <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]", category === cat.name ? "text-blue-600" : "text-slate-400")}>{cat.name.split(' ')[0]}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {category === "All" && <HotDeals />}

            {!isLoading && category === "All" && suggestedPicks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto max-w-full lg:max-w-6xl py-8 px-6 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-blue-600/5 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Our <span className="text-blue-600">Picks</span></h3>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {suggestedPicks.map((product) => (
                    <div key={`suggested-${product.id}`} className="min-w-[150px] md:min-w-[200px]">
                      <SuggestedProductTile product={product} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div id="marketplace" className="scroll-mt-24 space-y-6">
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-base md:text-xl font-black font-headline text-slate-900 uppercase tracking-tight italic">{category === "All" ? "Our Items" : `${category} Section`}</h3>
                    <motion.div {...buttonTap}>
                      <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={isLoading} className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 transition-colors">
                        <RefreshCcw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                      </Button>
                    </motion.div>
                  </div>
                  {category !== "All" && <Button variant="ghost" size="sm" onClick={() => setCategory("All")} className="text-[10px] font-black uppercase">View All Items</Button>}
                </div>

                {isLoading && products.length === 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
                    {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={fadeIn}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No items found in this section</p>
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
