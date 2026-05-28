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
  ShoppingCart, Star, Tag, ChevronRight, ChevronDown, ChevronUp, CheckCircle2,
  Box, SmartphoneIcon, Camera, MousePointer2,
  Keyboard, Power, Terminal, Usb, Battery, Speaker, Fingerprint, Shield, Clock,
  Palette, HardDrive, Info
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface MiniSpecProps {
  icon: any;
  label: string;
  value: any;
  active: boolean;
}

function MiniSpec({ icon: Icon, label, value, active }: MiniSpecProps) {
  if (value === undefined || value === null || value === "" || value === "N/A" || value === false) return null;
  
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  return (
    <div className="flex items-start gap-4 py-2 group/spec">
      <div className={cn(
        "p-2.5 rounded-xl shrink-0 transition-all duration-500",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 text-slate-300"
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
    <div className="flex items-center gap-2 mt-4 text-red-600 animate-pulse bg-red-50 px-3 py-1.5 rounded-full w-fit">
      <Clock className="w-3.5 h-3.5" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        Ends: {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
      </span>
    </div>
  );
};

export default function ProductDetailClient({ initialProduct }: { initialProduct: Product }) {
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, hasItem } = useWishlistStore();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    initialProduct.variants?.find(v => v.is_default) || initialProduct.variants?.[0]
  );
  
  const [openSpecs, setOpenSpecs] = useState<Record<string, boolean>>({});
  const [ratingInfo, setRatingInfo] = useState<{ average: number; count: number } | null>(null);
  
  const images = (product.image_urls && product.image_urls.length > 0 ? product.image_urls : [product.image_url]).filter(Boolean);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [product]);

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

  const toggleSpec = (variantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSpecs(prev => ({ ...prev, [variantId]: !prev[variantId] }));
  };

  const handleAddToCart = (variant?: ProductVariant) => {
    if (!product) return;
    addItem(product, variant || selectedVariant);
    toast({ 
      title: "Added to Basket", 
      description: `${product.name} ${variant ? `(${variant.label})` : ''} is now in your shopping cart.` 
    });
  };

  const isFavorite = hasItem(product.id);

  const advancedLabels: Record<string, { label: string, icon: any }> = {
    res: { label: 'Screen Resolution', icon: Monitor },
    ports: { label: 'I/O Ports', icon: Usb },
    battery_life: { label: 'Battery Life', icon: Battery },
    os: { label: 'Operating System', icon: Terminal },
    audio: { label: 'Speakers/Audio', icon: Speaker },
    camera: { label: 'Camera Quality', icon: Camera },
    refresh: { label: 'Refresh Rate', icon: Zap },
    charge: { label: 'Charging Speed', icon: Power },
    rating: { label: 'IP Rating', icon: ShieldCheck },
    biometrics: { label: 'Security', icon: Fingerprint }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 text-slate-900 bg-[#FBFBFE] tech-grid">
      <div className="max-w-6xl mx-auto space-y-10 md:space-y-12 animate-in fade-in duration-700">
        
        {/* 1. NAME & IDENTITY (FIRST) */}
        <div className="space-y-6">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:opacity-70 transition-colors font-bold uppercase text-[10px] tracking-widest mr-2">
                   <ArrowLeft className="w-3 h-3" /> Back
                 </Link>
                 {product.brand && (
                   <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20">{product.brand}</Badge>
                 )}
                 <div className="h-4 w-px bg-slate-200" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{product.category}</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 font-headline tracking-tight leading-[1.1] uppercase italic">
                {product.name}
              </h1>
           </div>

           <div className="flex items-center justify-between gap-6 px-1">
              {ratingInfo ? (
                <div className="flex items-center gap-6">
                   <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("w-4 h-4 md:w-5 md:h-5", (ratingInfo.average || 0) >= s ? "fill-current" : "opacity-20")} />
                      ))}
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">{(ratingInfo.average || 0).toFixed(1)}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({ratingInfo.count} Verified Reviews)</span>
                   </div>
                </div>
              ) : (
                <div className="flex text-slate-100"><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /></div>
              )}

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
        </div>

        {/* 2. GALLERY (SECOND) */}
        <div className="space-y-6">
          <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden bg-white shadow-sm flex items-center justify-center border border-slate-100 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-6 md:p-8"
              >
                {selectedImage ? (
                  <Image 
                    src={selectedImage} 
                    alt={product.name} 
                    fill 
                    priority 
                    className="object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-200">
                    <Box className="w-16 h-16" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Gallery Offline</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide max-w-4xl mx-auto px-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative min-w-[70px] w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 ${
                  selectedImage === img
                    ? "border-blue-500 scale-105 shadow-md"
                    : "border-slate-100 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Preview ${index}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 3. DETAILS & ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
           <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-600/5">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 italic font-headline">Option <span className="text-blue-600">Select</span></h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available hardware configurations</p>
                    </div>
                    <Badge variant="outline" className="h-9 rounded-xl px-4 font-black text-[10px] text-slate-400 border-slate-100 uppercase">{product.variants?.length || 0} Models</Badge>
                 </div>

                 <div className="space-y-4">
                    {product.variants?.map((v) => {
                       const isActive = selectedVariant?.id === v.id;
                       const isExpanded = openSpecs[v.id] || false;
                       const hasDiscount = !!v.discount;
                       
                       return (
                         <div
                           key={v.id}
                           onClick={() => setSelectedVariant(v)}
                           className={cn(
                             "text-left p-6 md:p-8 rounded-[2rem] border-2 transition-all group relative overflow-hidden cursor-pointer",
                             isActive 
                               ? (hasDiscount ? "border-red-600 bg-red-50/20 ring-4 ring-red-600/5 shadow-lg" : "border-blue-600 bg-blue-50/40 ring-4 ring-blue-600/5 shadow-lg")
                               : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 shadow-sm"
                           )}
                         >
                           <div className="flex flex-col gap-6">
                             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                               <div className="space-y-1 flex-1">
                                 <div className="flex items-center gap-3">
                                   <p className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? (hasDiscount ? "text-red-600" : "text-blue-600") : "text-slate-400")}>{v.condition || 'Factory New'}</p>
                                   {hasDiscount && (
                                     <Badge className="bg-red-600 text-white border-none font-black uppercase text-[8px] tracking-widest px-2 py-0.5">Special Offer</Badge>
                                   )}
                                 </div>
                                 <h4 className="text-lg md:text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase font-headline italic tracking-tighter">{v.label}</h4>
                                 {hasDiscount && v.discount?.ends_at && isActive && <CountdownTimer expiryDate={v.discount.ends_at} />}
                               </div>
                               <div className="md:text-right">
                                 {hasDiscount ? (
                                   <>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-through opacity-60">GHS {v.price.toLocaleString()}</p>
                                     <p className="text-2xl md:text-4xl font-black text-red-600 italic tracking-tighter">GH₵ {v.discount!.discount_price.toLocaleString()}</p>
                                   </>
                                 ) : (
                                   <p className="text-2xl md:text-4xl font-black text-blue-600 italic tracking-tighter">GH₵ {v.price.toLocaleString()}</p>
                                 )}
                               </div>
                             </div>

                             <div className="space-y-4">
                               <Collapsible open={isExpanded}>
                                 <CollapsibleContent className="space-y-10 animate-in slide-in-from-top-2 duration-300">
                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 pt-8 border-t border-slate-100">
                                     <MiniSpec icon={Cpu} label="Processor" value={v.cpu} active={isActive} />
                                     <MiniSpec icon={SmartphoneIcon} label="Chipset" value={v.chipset} active={isActive} />
                                     <MiniSpec icon={CircuitBoard} label="Memory (RAM)" value={v.ram} active={isActive} />
                                     <MiniSpec icon={HardDrive} label="Storage" value={v.storage} active={isActive} />
                                     <MiniSpec icon={Layers} label="Graphics (GPU)" value={v.gpu} active={isActive} />
                                     <MiniSpec icon={Monitor} label="Screen" value={v.screen} active={isActive} />
                                     <MiniSpec icon={MousePointer2} label="Touch Interface" value={v.touchscreen} active={isActive} />
                                     <MiniSpec icon={Keyboard} label="Backlit Keys" value={v.keyboard_light} active={isActive} />
                                     <MiniSpec icon={Fingerprint} label="Biometric ID" value={v.fingerprint} active={isActive} />
                                     <MiniSpec icon={Palette} label="Device Color" value={v.color} active={isActive} />
                                     <MiniSpec icon={Battery} label="Energy Cell" value={v.battery} active={isActive} />
                                     <MiniSpec icon={Zap} label="Network Link" value={v.network} active={isActive} />
                                     <MiniSpec icon={ShieldCheck} label="Coverage" value={product.warranty} active={isActive} />
                                     <MiniSpec icon={Shield} label="Verified Condition" value={v.condition} active={isActive} />

                                     {product.advanced_specs && Object.entries(product.advanced_specs).map(([key, val]) => {
                                       const labelData = advancedLabels[key] || { label: key.toUpperCase().replace(/_/g, ' '), icon: Info };
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
                                   className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity mt-4", hasDiscount ? "text-red-600" : "text-blue-600")}
                                 >
                                   {isExpanded ? (
                                     <><ChevronUp className="w-3 h-3" /> Hide Details</>
                                   ) : (
                                     <><ChevronDown className="w-3 h-3" /> View Full Specifications</>
                                   )}
                                 </button>
                               </Collapsible>
                             </div>

                             <div className="pt-4 border-t border-slate-50">
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(v); }}
                                  className={cn(
                                    "w-full h-14 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 shadow-lg transition-all",
                                    isActive 
                                      ? (hasDiscount ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20") 
                                      : "bg-slate-950 hover:bg-blue-600 text-white shadow-slate-950/10"
                                  )}
                                  disabled={v.stock <= 0}
                                >
                                  {v.stock <= 0 ? "Out of Stock" : <><ShoppingCart className="w-4 h-4" /> Add To Basket</>}
                                </Button>
                             </div>
                           </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 italic font-headline">Product Vision</h2>
                 </div>
                 <p className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap px-2">
                   {product.description || "Premium hardware curated for efficiency and style. Every unit undergoes strict quality control."}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group hover:border-blue-100 transition-colors">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><ShieldCheck className="w-6 h-6" /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Authentic Unit</span>
                 </div>
                 <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group hover:border-emerald-100 transition-colors">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><Truck className="w-6 h-6" /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Regional Delivery</span>
                 </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 relative z-10">Quality Assurance</h4>
                 <p className="text-sm font-medium leading-relaxed relative z-10">
                   {product.warranty}. Each hardware unit is technically verified by our expert team before shipping.
                 </p>
                 <div className="pt-4 border-t border-white/5 relative z-10">
                    <Link href="/terms" className="text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors">Full Protection Policy &rarr;</Link>
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-16 border-t border-slate-200">
           <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}
