"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { 
  Laptop, Smartphone, Shirt, GraduationCap, Zap, 
  LayoutGrid, Sparkles, ArrowRight, AlertCircle, RefreshCcw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  type CarouselApi 
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <motion.div variants={fadeIn} whileHover={{ scale: 1.05 }} className="h-full">
      <Link href={`/product/${product.id}`} className="flex flex-col items-center group transition-all duration-300">
        <div className="relative aspect-square w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-slate-200/40 mb-3 shadow-sm border border-slate-100/50">
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill 
            className="object-contain p-5" 
            sizes="(max-width: 768px) 30vw, 15vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-tighter text-center line-clamp-1 px-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </span>
      </Link>
    </motion.div>
  );
}

export default function CatalogPage() {
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [seed, setSeed] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
      } else {
        setProducts(data || []);
        // Update seed to trigger fresh randomization
        setSeed(Math.random());
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "Failed to connect to the store database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const categories = [
    { name: "All", icon: LayoutGrid },
    { name: "Laptops", imageUrl: "https://i.ibb.co/nMy2cj24/dell-icon-11-removebg-preview.png", icon: Laptop },
    { name: "Phones", imageUrl: "https://i.ibb.co/WvdsfcTh/Samsung-Galaxy-S24-Ultra-Titanium-Violet-Smartphone-transparent-PNG-image-300x300-removebg-preview.png", icon: Smartphone },
    { name: "Accessories", imageUrl: "https://i.ibb.co/qFn4CMBf/hd-blue-apple-smart-watch-series-6-png-704081694622170ogfulucxw5-removebg-preview.png", icon: Zap },
    { name: "Closet", imageUrl: "https://i.ibb.co/MxNHbcw2/Armor-Hoodie-Black-01-removebg-preview.png", icon: Shirt },
    { name: "Educational Consult", imageUrl: "https://i.ibb.co/pB4yX4JL/high-resolution-graduation-cap-png-icon-17-removebg-preview.png", icon: GraduationCap },
  ];

  const featuredProducts = useMemo(() => products.filter(p => p.category === "Laptops" || p.category === "Phones").slice(0, 5), [products]);
  const filteredProducts = useMemo(() => products.filter((p) => category === "All" || p.category === category), [products, category]);
  
  // Randomize Suggested Picks based on the seed
  const suggestedPicks = useMemo(() => {
    if (products.length === 0) return [];
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [products, seed]);

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />

      <main className="flex-1 pb-32 md:pb-12 text-slate-900">
        <div className="container mx-auto px-5 pt-6 space-y-16">
          
          {isLoading && products.length === 0 ? (
            <section className="py-8 px-2 md:px-10">
              <Skeleton className="w-full h-[350px] md:h-[480px] rounded-[3rem]" />
            </section>
          ) : category === "All" && featuredProducts.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative group py-8 px-2 md:px-10 overflow-hidden"
            >
              <Carousel 
                setApi={setApi} 
                className="w-full relative z-10" 
                opts={{ loop: true, align: 'center' }}
                plugins={[Autoplay({ delay: 5000 })]}
              >
                <CarouselContent className="-ml-4 flex items-center h-[350px] md:h-[480px]">
                  {featuredProducts.map((product, index) => (
                    <CarouselItem key={product.id} className="pl-4 basis-[85%] md:basis-[60%] lg:basis-[45%] transition-all duration-500 ease-out">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className={cn(
                          "relative h-[280px] md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden transition-all duration-700 shadow-xl group/item",
                          current === index ? "scale-100 opacity-100 ring-2 ring-blue-500/20" : "scale-85 md:scale-90 opacity-40"
                        )}>
                          <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-blue-50/80 to-blue-100/40 shadow-inner flex items-center justify-center">
                             <Image src={product.image_url} alt={product.name} fill className="object-contain p-8 md:p-14 transition-transform duration-1000 group-hover/item:scale-105 z-10" priority />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent z-20" />
                          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-30">
                             <div className="space-y-0.5">
                                <h2 className="text-xl md:text-2xl font-bold text-white font-headline tracking-tight line-clamp-1 drop-shadow-md">{product.name}</h2>
                                <p className="text-blue-200 font-bold text-lg md:text-xl drop-shadow-md">GH₵{product.price.toLocaleString()}</p>
                             </div>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.section>
          )}

          {error && (
            <div className="max-w-4xl mx-auto px-4">
              <Alert variant="destructive" className="rounded-[2rem] bg-red-50 p-8 shadow-xl shadow-red-500/5">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold uppercase tracking-tight">System Message</AlertTitle>
                <AlertDescription className="mt-4 space-y-4">
                  <p className="text-sm font-medium">Information: {error}</p>
                  <Button variant="outline" className="h-10 text-[10px] font-black uppercase" onClick={fetchProducts}>Retry Update</Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!error && (
            <motion.div 
              variants={staggerContainer(0.05)}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <motion.h2 variants={slideUp} className="text-xl font-bold font-headline text-slate-900 uppercase tracking-tight">Popular Sections</motion.h2>
                <Link href="/categories">
                  <motion.button variants={fadeIn} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:opacity-70">Browse All</motion.button>
                </Link>
              </div>
              
              <div className="flex gap-6 overflow-x-auto md:justify-center pb-4 scrollbar-hide px-2">
                {categories.map((cat) => (
                  <motion.button 
                    key={cat.name} 
                    variants={slideUp}
                    {...buttonTap}
                    onClick={() => setCategory(cat.name)} 
                    className="flex flex-col items-center gap-3 shrink-0 group"
                  >
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

          <div id="marketplace" className="scroll-mt-24 space-y-12">
            {category === "All" && !isLoading && suggestedPicks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mx-auto max-w-[100%] md:max-w-[70%] py-12 px-4 md:px-8 bg-blue-50/50 rounded-[2.5rem] md:rounded-[3rem] border border-blue-100/50"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Suggested <span className="text-blue-600 italic">Picks</span></h3>
                  </div>
                </div>
                <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {suggestedPicks.map((product) => (
                      <CarouselItem key={`suggested-${product.id}`} className="pl-4 basis-[45%] md:basis-[20%]">
                        <SuggestedProductTile product={product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>
            )}

            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-base md:text-xl font-bold font-headline text-slate-900 uppercase tracking-tight">{category === "All" ? "Current Items" : `${category} Section`}</h3>
                  <motion.div {...buttonTap}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={fetchProducts} 
                      disabled={isLoading}
                      className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <RefreshCcw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                    </Button>
                  </motion.div>
                </div>
                {category !== "All" && <Button variant="ghost" size="sm" onClick={() => setCategory("All")} className="text-[10px] font-bold uppercase">View All</Button>}
              </div>

              {isLoading && products.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
                  {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div 
                  variants={staggerContainer(0.04)}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} variants={fadeIn}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No items found in this section</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
