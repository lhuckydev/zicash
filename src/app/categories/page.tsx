"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryProductSkeleton() {
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

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Laptops");

  const categories = useMemo(() => [
    { 
      id: "laptops",
      name: "Laptops", 
      imageUrl: "https://i.ibb.co/nMy2cj24/dell-icon-11-removebg-preview.png",
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

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setProducts(data || []);
      // Artifical delay for skeleton demonstration if needed, but keeping it fast
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Left Side Navigation Rail */}
        <aside className="w-24 md:w-32 bg-white border-r border-slate-100 flex flex-col overflow-y-auto scrollbar-hide shrink-0">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "relative py-6 px-2 flex flex-col items-center gap-2 transition-all group",
                  isActive ? "bg-slate-50" : "bg-white hover:bg-slate-50/50"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center p-2 transition-transform duration-300 group-active:scale-90",
                  isActive ? "bg-white shadow-xl shadow-blue-500/10" : "bg-slate-50 opacity-40 group-hover:opacity-100"
                )}>
                  <div className="relative w-full h-full">
                    <Image src={cat.imageUrl} alt={cat.name} fill className="object-contain" />
                  </div>
                </div>
                
                <span className={cn(
                  "text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-center leading-tight",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {cat.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Right Side Content Area */}
        <section className="flex-1 overflow-y-auto scrollbar-hide pb-24 md:pb-12">
          <div className="p-4 md:p-8 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CategoryProductSkeleton key={i} />
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
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Package className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching units found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}