"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariant, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import Image from "next/image";
import { 
  ArrowLeft, Heart, ShieldCheck, Truck, Cpu, Database, 
  CircuitBoard, Monitor, Smartphone, 
  Zap, 
  Layers, 
  ShoppingCart, Star, Loader2, Tag, ChevronRight, ChevronDown, ChevronUp, CheckCircle2,
  Box, Maximize, SmartphoneIcon, Camera, MousePointer2,
  Keyboard, Power, Terminal, Usb, Battery, Speaker, Fingerprint, Shield, Clock,
  Globe, Palette, HardDrive, Settings2
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
  }, [initialProduct.id, selectedVariant]);

  useEffect(() => {
    if (!api) return;
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

  // Helper for advanced specs mapping
  const advancedLabels: Record<string, { label: string, icon: any }> = {
    res: { label: 'Screen Resolution', icon: Monitor },
    ports: { label: 'I/O Ports', icon: Usb },
    battery: { label: 'Battery Life', icon: Battery },
    os: { label: 'Operating System', icon: Terminal },
    audio: { label: 'Speakers/Audio', icon: Speaker },
    camera: { label: 'Camera Quality', icon: Camera },
    refresh: { label: 'Refresh Rate', icon: Zap },
    charge: { label: 'Charging Speed', icon: Power },
    rating: { label: 'IP Rating', icon: ShieldCheck },
    biometrics: { label: 'Security', icon: Fingerprint }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 text-slate-900 bg-[#FBFBFE] tech-grid">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
           <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
             <ArrowLeft className="w-3 h-3" /> Back To Catalog
           </Link>
           <button 
             onClick={() => toggleItem(product)}
             className={cn(
               "p-3 rounded-full border bg-white transition-all shadow-sm",
               isFavorite ? "text-red-500 border-red-100 bg-red-50" : "text-slate-300 border-slate-100 hover:text-slate-600"
             )}
           >
             <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
           </button>
        </div>

        {/* 1. PRODUCT NAME & RATINGS SECTION */}
        <div className="space-y-8">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 {product.brand && (
                   <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20">{product.brand}</Badge>
                 )}
                 <div className="h-4 w-px bg-slate-200" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-8xl font-black text-slate-900 font-headline tracking-tighter leading-[0.95] uppercase italic">
                {product.name}
              </h1>
           </div>

           {/* Ratings Summary Bar */}
           {ratingInfo && (
             <div className="flex items-center gap-6 px-1">
                <div className="flex text-amber-400">
                   {[1, 2, 3, 4, 5].map((s) => (
                     <Star key={s} className={cn("w-5 h-5 md:w-6 md:h-6", (ratingInfo?.average || 0) >= s ? "fill-current" : "opacity-20")} />
                   ))}
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-lg md:text-xl font-black text-slate-900">{(ratingInfo?.average || 0).toFixed(1)}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({ratingInfo.count} Verified Reviews)</span>
                </div>
             </div>
           )}
        </div>

        {/* 2. PRODUCT PICTURE SECTION */}
        <div className="relative group">
           <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[4rem] -z-10" />
           <div className="bg-white rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden p-6 md:p-12">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                 <div className="flex-1 w-full order-1 lg:order-2">
                    <div className="relative w-full mx-auto aspect-square md:aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-50">
                       {productImages.length > 0 ? (
                          <Carousel setApi={setApi} className="w-full h-full">
                             <CarouselContent className="ml-0 h-full flex">
                                {productImages.map((url, idx) => (
                                  <CarouselItem key={idx} className="relative basis-full h-full pl-0 shrink-0">
                                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                                      <Image 
                                        src={url as string} 
                                        alt={`${product?.name} ${idx + 1}`} 
                                        fill 
                                        className="object-contain transition-all duration-1000 group-hover:scale-105" 
                                        priority={idx === 0} 
                                        sizes="(max-width: 768px) 100vw, 60vw"
                                      />
                                    </div>
                                  </CarouselItem>
                                ))}
                             </CarouselContent>
                          </Carousel>
                       ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                            <Box className="w-12 h-12 text-slate-200" />
                          </div>
                       )}
                    </div>
                 </div>
                 
                 <div className="lg:w-24 shrink-0 order-2 lg:order-1 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto scrollbar-hide py-2 w-full lg:h-[500px]">
                    {productImages.map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleThumbnailClick(idx)}
                        className={cn(
                          "relative aspect-square w-16 lg:w-full rounded-2xl border-2 transition-all cursor-pointer shadow-sm shrink-0 bg-white",
                          current === idx ? "border-blue-600 ring-4 ring-blue-500/10" : "border-transparent opacity-40 hover:opacity-100"
                        )}
                      >
                        <Image src={url as string} alt="Thumbnail" fill className="object-contain p-2" />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* 3. HARDWARE CONFIGURATIONS & SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
           <div className="lg:col-span-7 space-y-12">
              <div className="space-y-8 bg-white p-6 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-600/5">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 italic font-headline">Select Your <span className="text-blue-600">Model</span></h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing varies by hardware configuration</p>
                    </div>
                    <Badge variant="outline" className="h-10 rounded-xl px-4 font-black text-xs text-slate-400 border-slate-100">{product.variants?.length || 0} Options</Badge>
                 </div>

                 <div className="space-y-6">
                    {product.variants?.map((v) => {
                       const isActive = selectedVariant?.id === v.id;
                       const isExpanded = openSpecs[v.id] || false;
                       const hasDiscount = !!v.discount;
                       
                       return (
                         <div
                           key={v.id}
                           onClick={() => setSelectedVariant(v)}
                           className={cn(
                             "text-left p-8 md:p-10 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden cursor-pointer",
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
                                   <CollapsibleContent className="space-y-12 animate-in slide-in-from-top-2 duration-300">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 pt-10 border-t border-slate-100/50">
                                       <MiniSpec icon={Cpu} label="Processor" value={v.cpu} active={isActive} />
                                       <MiniSpec icon={SmartphoneIcon} label="Chipset" value={v.chipset} active={isActive} />
                                       <MiniSpec icon={CircuitBoard} label="RAM" value={v.ram} active={isActive} />
                                       <MiniSpec icon={Database} label="Storage" value={v.storage} active={isActive} />
                                       <MiniSpec icon={Layers} label="Graphics" value={v.gpu} active={isActive} />
                                       <MiniSpec icon={Maximize} label="Display" value={v.screen} active={isActive} />
                                       <MiniSpec icon={MousePointer2} label="Touchscreen" value={v.touchscreen} active={isActive} />
                                       <MiniSpec icon={Keyboard} label="Backlit Keys" value={v.keyboard_light} active={isActive} />
                                       <MiniSpec icon={Fingerprint} label="Biometrics" value={v.fingerprint} active={isActive} />
                                       <MiniSpec icon={Palette} label="Hardware Color" value={v.color} active={isActive} />
                                       <MiniSpec icon={Battery} label="Battery Unit" value={v.battery} active={isActive} />
                                       <MiniSpec icon={Zap} label="Network/WiFi" value={v.network} active={isActive} />
                                       <MiniSpec icon={ShieldCheck} label="ZiCash Warranty" value={product.warranty} active={isActive} />
                                       <MiniSpec icon={Shield} label="Unit Condition" value={v.condition} active={isActive} />

                                       {product.advanced_specs && Object.entries(product.advanced_specs).map(([key, val]) => {
                                         const labelData = advancedLabels[key] || { label: key.toUpperCase().replace('_', ' '), icon: Settings2 };
                                         return (
                                           <MiniSpec 
                                             key={key} 
                                             icon={labelData.icon} 
                                             label={labelData.label} 
                                             value={val} 
                                             active={isActive} 
                                           />
                                         );
                                       })}
                                     </div>
                                   </CollapsibleContent>

                                   <button
                                     onClick={(e) => toggleSpec(v.id, e)}
                                     className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity mt-4", hasDiscount ? "text-red-600" : "text-blue-600")}
                                   >
                                     {isExpanded ? (
                                       <><ChevronUp className="w-3 h-3" /> Show Less</>
                                     ) : (
                                       <><ChevronDown className="w-3 h-3" /> View Full Specifications</>
                                     )}
                                   </button>
                                 </Collapsible>
                               </div>
                             )}

                             <div className="pt-6 border-t border-slate-50">
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(v); }}
                                  className={cn(
                                    "w-full h-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] gap-3 shadow-lg transition-all",
                                    isActive 
                                      ? (hasDiscount ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20") 
                                      : "bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/10"
                                  )}
                                  disabled={v.stock <= 0}
                                >
                                  <ShoppingCart className="w-5 h-5" /> Add To Basket
                                </Button>
                             </div>
                           </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-12">
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 italic">Description</h2>
                 </div>
                 <p className="text-xl text-slate-600 leading-relaxed font-medium whitespace-pre-wrap px-2">
                   {product.description || "Premium quality item. Contact support for full details."}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4 group hover:border-blue-100 transition-colors">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><ShieldCheck className="w-8 h-8" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quality Verified</span>
                 </div>
                 <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4 group hover:border-emerald-100 transition-colors">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><Truck className="w-8 h-8" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fast Delivery</span>
                 </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 relative z-10">Purchase Protection</h4>
                 <p className="text-sm font-medium leading-relaxed relative z-10">
                   All items are covered by ZiCash standard warranty. Every piece of hardware undergoes a 24-point check before dispatch.
                 </p>
                 <div className="pt-4 border-t border-white/5 relative z-10">
                    <Link href="/terms" className="text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors">View Warranty Terms &rarr;</Link>
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-20 border-t border-slate-200">
           <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}