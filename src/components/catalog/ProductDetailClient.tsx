"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariant, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import Image from "next/image";
import { 
  ArrowLeft, Heart, ShieldCheck, Truck, Cpu, Database, 
  CircuitBoard, Monitor, Smartphone, 
  Zap, Timer, 
  Video, Layers, Info,  
  ShoppingCart, Star, Loader2, Tag, ChevronRight, ChevronDown, ChevronUp, CheckCircle2,
  Box, Maximize, SmartphoneIcon, Camera, MousePointer2,
  Keyboard, Power, Terminal, Usb, Battery, Speaker, Fingerprint, Shield, Clock
} from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  type CarouselApi
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MiniSpecProps {
  icon: any;
  label: string;
  value: any;
  active: boolean;
}

function MiniSpec({ icon: Icon, label, value, active }: MiniSpecProps) {
  if (value === undefined || value === null || value === "" || value === "N/A") return null;
  
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  return (
    <div className="flex items-start gap-4 py-2">
      <div className={cn(
        "p-2.5 rounded-xl shrink-0 transition-colors duration-500",
        active ? "bg-blue-100/50 text-blue-600" : "bg-slate-50 text-slate-300"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0 pt-0.5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-2">{label}</span>
        <span className={cn(
          "text-xs font-black italic leading-normal break-words whitespace-pre-wrap",
          active ? "text-slate-900" : "text-slate-600"
        )}>{displayValue}</span>
      </div>
    </div>
  );
}

const CountdownTimer = ({ expiryDate }: { expiryDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{h:number, m:number, s:number} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiryDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 mt-4 text-red-600 animate-pulse">
      <Clock className="w-3.5 h-3.5" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        Offer Ends in: {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
      </span>
    </div>
  );
};

export default function ProductDetailClient({ initialProduct }: { initialProduct: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, hasItem } = useWishlistStore();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    initialProduct.variants?.find(v => v.is_default) || initialProduct.variants?.[0]
  );
  
  const [isAdding, setIsAdding] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [openSpecs, setOpenSpecs] = useState<Record<string, boolean>>({});
  const [ratingInfo, setRatingInfo] = useState<{ average: number; count: number } | null>(null);

  const isSimpleCategory = ["Accessories", "Educational Consult"].includes(product.category);

  useEffect(() => {
    async function fetchFullData() {
      const { supabase } = await import('@/lib/supabase');
      
      const { data: ratingData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', initialProduct.id);
      
      if (ratingData && ratingData.length > 0) {
        const average = ratingData.reduce((acc, r) => acc + r.rating, 0) / ratingData.length;
        setRatingInfo({ average, count: ratingData.length });
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*, discount:discounts(*))
        `)
        .eq('id', initialProduct.id)
        .single();
      
      if (!error && data) {
        setProduct(data);
        if (!selectedVariant) {
          setSelectedVariant(data.variants?.find((v: any) => v.is_default) || data.variants?.[0]);
        }
      }
    }
    fetchFullData();
  }, [initialProduct.id]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleThumbnailClick = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  const toggleSpec = (variantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSpecs(prev => ({ ...prev, [variantId]: !prev[variantId] }));
  };

  const handleAddToCart = (variant?: ProductVariant) => {
    if (!product) return;
    setIsAdding(true);
    addItem(product, variant || selectedVariant);
    toast({ 
      title: "Added to Basket", 
      description: `${product.name} ${variant ? `(${variant.label})` : ''} is now in your shopping cart.` 
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  const isFavorite = hasItem(product.id);
  const productImages = (product.image_urls?.length ? product.image_urls : [product.image_url]).filter(Boolean);

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 text-slate-900 bg-[#FBFBFE] tech-grid">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft className="w-3 h-3" /> Back To Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-6 space-y-20">
            <div className="flex flex-col md:flex-row gap-6 h-fit lg:pt-48">
              <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide shrink-0 md:w-20 pb-2 md:pb-0">
                {productImages.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleThumbnailClick(idx)}
                    className={cn(
                      "relative aspect-square w-16 md:w-full rounded-2xl border-2 overflow-hidden bg-white cursor-pointer transition-all shrink-0 shadow-sm",
                      current === idx ? "border-blue-600 ring-4 ring-blue-500/10" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={url as string} alt={`View ${idx + 1}`} fill className="object-contain p-2" />
                  </div>
                ))}
              </div>

              <div className="flex-1 order-1 md:order-2 relative aspect-square max-h-[600px] bg-white rounded-[3rem] overflow-hidden shadow-2xl group border border-slate-100">
                <Carousel setApi={setApi} className="w-full h-full [&>div]:h-full">
                  <CarouselContent className="h-full ml-0">
                    {productImages.map((url, idx) => (
                      <CarouselItem key={idx} className="relative h-full w-full pl-0">
                        <div className="relative w-full h-full bg-white flex items-center justify-center">
                          <Image 
                            src={url as string} 
                            alt={`${product?.name} ${idx + 1}`} 
                            fill 
                            className="object-contain p-6 transition-all duration-1000 group-hover:scale-105" 
                            priority={idx === 0} 
                            sizes="(max-width: 768px) 100vw, 40vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                  <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 italic">Product Overview</h2>
               </div>
               <p className="text-xl text-slate-600 leading-relaxed font-medium whitespace-pre-wrap px-2">
                 {product.description || "Premium quality item. Contact support for full details."}
               </p>
            </div>

            <div className="hidden lg:block">
               <ProductReviews productId={product.id} />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 {product.brand && (
                   <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-sm">{product.brand}</Badge>
                 )}
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase italic">
                {product.name}
              </h1>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-8 bg-white p-4 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-600 ml-4">Select Configuration</h3>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 rounded-lg mr-4">{product.variants.length} Options</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {product.variants.map((v) => {
                      const isActive = selectedVariant?.id === v.id;
                      const isExpanded = openSpecs[v.id] || false;
                      const hasDiscount = !!v.discount;
                      
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "text-left p-6 md:p-10 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden cursor-pointer",
                            isActive 
                              ? (hasDiscount ? "border-red-600 bg-red-50/20 ring-8 ring-red-600/5 shadow-xl" : "border-blue-600 bg-blue-50/40 ring-8 ring-blue-600/5 shadow-xl")
                              : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 shadow-sm"
                          )}
                        >
                          <div className="flex flex-col gap-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-3">
                                  <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? (hasDiscount ? "text-red-600" : "text-blue-600") : "text-slate-400")}>{v.condition || 'New'}</p>
                                  {hasDiscount && (
                                    <Badge className="bg-red-600 text-white border-none font-black uppercase text-[8px] tracking-widest">Special Deal</Badge>
                                  )}
                                </div>
                                <h4 className="text-lg md:text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase break-words">{v.label}</h4>
                                {hasDiscount && v.discount?.ends_at && isActive && <CountdownTimer expiryDate={v.discount.ends_at} />}
                              </div>
                              <div className="md:text-right">
                                {hasDiscount ? (
                                  <>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest line-through opacity-60">GHS {v.price.toLocaleString()}</p>
                                    <p className="text-2xl md:text-4xl font-black text-red-600 italic tracking-tighter">GH₵ {v.discount!.discount_price.toLocaleString()}</p>
                                  </>
                                ) : (
                                  <p className="text-2xl md:text-4xl font-black text-blue-600 italic tracking-tighter">GH₵ {v.price.toLocaleString()}</p>
                                )}
                              </div>
                            </div>

                            {!isSimpleCategory && (
                              <div className="space-y-4">
                                <Collapsible open={isExpanded} onOpenChange={() => {}}>
                                  <CollapsibleContent className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 pt-8 border-t border-slate-100/50">
                                      {product.category === "Laptops" ? (
                                        <>
                                          <MiniSpec icon={Cpu} label="Processor" value={v.cpu} active={isActive} />
                                          <MiniSpec icon={CircuitBoard} label="RAM" value={v.ram} active={isActive} />
                                          <MiniSpec icon={Database} label="Storage" value={v.storage} active={isActive} />
                                          <MiniSpec icon={Layers} label="GPU" value={v.gpu} active={isActive} />
                                          <MiniSpec icon={Maximize} label="Display" value={v.screen} active={isActive} />
                                          <MiniSpec icon={ShieldCheck} label="Warranty" value={product.warranty} active={isActive} />
                                        </>
                                      ) : (
                                        <>
                                          <MiniSpec icon={SmartphoneIcon} label="Chipset" value={v.chipset} active={isActive} />
                                          <MiniSpec icon={CircuitBoard} label="RAM" value={v.ram} active={isActive} />
                                          <MiniSpec icon={Database} label="Storage" value={v.storage} active={isActive} />
                                          <MiniSpec icon={Power} label="Battery" value={v.battery} active={isActive} />
                                          <MiniSpec icon={ShieldCheck} label="Warranty" value={product.warranty} active={isActive} />
                                        </>
                                      )}
                                    </div>
                                  </CollapsibleContent>

                                  <button
                                    onClick={(e) => toggleSpec(v.id, e)}
                                    className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity", hasDiscount ? "text-red-600" : "text-blue-600")}
                                  >
                                    {isExpanded ? (
                                      <><ChevronUp className="w-3 h-3" /> Less Info</>
                                    ) : (
                                      <><ChevronDown className="w-3 h-3" /> Full Specifications</>
                                    )}
                                  </button>
                                </Collapsible>
                              </div>
                            )}

                            <div className="pt-6 border-t border-slate-50">
                               <Button 
                                 onClick={(e) => { e.stopPropagation(); handleAddToCart(v); }}
                                 className={cn(
                                   "w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 shadow-lg transition-all",
                                   isActive 
                                     ? (hasDiscount ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20") 
                                     : "bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/10"
                                 )}
                                 disabled={v.stock <= 0}
                               >
                                 <ShoppingCart className="w-4 h-4" /> Add To Basket
                               </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
