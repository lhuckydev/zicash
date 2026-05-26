"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariant, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { 
  ArrowLeft, Heart, ShieldCheck, Truck, Cpu, Database, 
  CircuitBoard, Monitor, Smartphone, 
  Zap, Timer, 
  Video, Layers, Info,  
  ShoppingCart, Star, Loader2, Tag, ChevronRight, CheckCircle2,
  Box, Maximize, SmartphoneIcon, Camera, MousePointer2,
  Keyboard, Power, Terminal, Usb, Battery, Speaker, Fingerprint, Shield
} from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  type CarouselApi
} from "@/components/ui/carousel";
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
    <div className="flex items-center gap-3 py-1">
      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-slate-300")} />
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</span>
        <span className={cn(
          "text-[11px] font-black italic truncate leading-none",
          active ? "text-slate-900" : "text-slate-600"
        )}>{displayValue}</span>
      </div>
    </div>
  );
}

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

  const isSimpleCategory = ["Accessories", "Educational Consult"].includes(product.category);

  useEffect(() => {
    async function fetchFullProduct() {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
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
    fetchFullProduct();
  }, [initialProduct.id, selectedVariant]);

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

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    addItem(product, selectedVariant);
    toast({ 
      title: "Added to Cart", 
      description: `${product.name} added to your selection.` 
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  const isFavorite = hasItem(product.id);
  const productImages = (product.image_urls?.length ? product.image_urls : [product.image_url]).filter(Boolean);
  
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.stock_status === 'In Stock';

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 text-slate-900 bg-[#FBFBFE] tech-grid">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft className="w-3 h-3" /> Back To Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5 flex flex-col md:flex-row gap-6">
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

            <div className="flex-1 order-1 md:order-2 relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl group border border-slate-100">
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
              
              <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
                 {product.featured && (
                   <Badge className="bg-slate-900 text-white border-none font-black uppercase text-[9px] tracking-widest px-4 py-2 shadow-xl">Top Selection</Badge>
                 )}
                 <Badge className="bg-blue-600/10 backdrop-blur-md text-blue-600 border-none font-black uppercase text-[8px] tracking-widest px-3 py-1 shadow-sm">Verified</Badge>
              </div>

              <button 
                onClick={() => toggleItem(product)} 
                className={cn(
                  "absolute top-8 right-8 p-3 rounded-full border shadow-xl transition-all z-20 hover:scale-110 active:scale-95",
                  isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-300 bg-white/90 border-slate-100"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 {product.brand && (
                   <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-sm">{product.brand}</Badge>
                 )}
                 {product.brand && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">/</span>}
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                 <div className="flex text-amber-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Quality</span>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-8 bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-600">Available Specifications</h3>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 rounded-lg">{product.variants.length} Options</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-8">
                    {product.variants.map((v) => {
                      const isActive = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "text-left p-10 rounded-[3rem] border-2 transition-all group relative overflow-hidden",
                            isActive 
                              ? "border-blue-600 bg-blue-50/40 ring-8 ring-blue-600/5 shadow-xl" 
                              : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 shadow-sm"
                          )}
                        >
                          {isActive && <div className="absolute top-0 right-0 w-10 h-10 bg-blue-600 flex items-center justify-center rounded-bl-2xl text-white shadow-lg"><CheckCircle2 className="w-5 h-5" /></div>}
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                            <div className="space-y-6 flex-1">
                              <div>
                                <p className={cn("text-[11px] font-black uppercase tracking-widest mb-2", isActive ? "text-blue-600" : "text-slate-400")}>{v.condition || 'New'}</p>
                                <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">{v.label}</h4>
                              </div>

                              {!isSimpleCategory && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-8 pt-8 border-t border-slate-100/50">
                                  {product.category === "Laptops" ? (
                                    <>
                                      <MiniSpec icon={Cpu} label="Processor" value={v.cpu} active={isActive} />
                                      <MiniSpec icon={CircuitBoard} label="Memory" value={v.ram} active={isActive} />
                                      <MiniSpec icon={Database} label="Storage" value={v.storage} active={isActive} />
                                      <MiniSpec icon={Layers} label="Graphics" value={v.gpu} active={isActive} />
                                      <MiniSpec icon={Maximize} label="Display" value={v.screen || product.advanced_specs?.res} active={isActive} />
                                      <MiniSpec icon={MousePointer2} label="Touch" value={v.touchscreen} active={isActive} />
                                      <MiniSpec icon={Keyboard} label="Light" value={v.keyboard_light} active={isActive} />
                                      <MiniSpec icon={Fingerprint} label="Biometrics" value={v.fingerprint || product.fingerprint} active={isActive} />
                                      <MiniSpec icon={Terminal} label="OS" value={product.advanced_specs?.os} active={isActive} />
                                      <MiniSpec icon={Usb} label="Ports" value={product.advanced_specs?.ports} active={isActive} />
                                      <MiniSpec icon={Battery} label="Battery" value={product.advanced_specs?.battery} active={isActive} />
                                      <MiniSpec icon={Speaker} label="Audio" value={product.advanced_specs?.audio} active={isActive} />
                                    </>
                                  ) : (
                                    <>
                                      <MiniSpec icon={SmartphoneIcon} label="Chipset" value={v.chipset} active={isActive} />
                                      <MiniSpec icon={CircuitBoard} label="RAM" value={v.ram} active={isActive} />
                                      <MiniSpec icon={Database} label="Storage" value={v.storage} active={isActive} />
                                      <MiniSpec icon={Power} label="Battery" value={v.battery} active={isActive} />
                                      <MiniSpec icon={Camera} label="Camera" value={product.advanced_specs?.camera} active={isActive} />
                                      <MiniSpec icon={Zap} label="Charging" value={product.advanced_specs?.charge} active={isActive} />
                                      <MiniSpec icon={Shield} label="Rating" value={product.advanced_specs?.rating} active={isActive} />
                                      <MiniSpec icon={Fingerprint} label="Security" value={v.fingerprint || product.advanced_specs?.biometrics} active={isActive} />
                                      <MiniSpec icon={Timer} label="Hz" value={product.advanced_specs?.refresh} active={isActive} />
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="md:text-right shrink-0">
                               <p className="text-3xl font-black text-blue-600 italic tracking-tighter">GH₵ {v.price.toLocaleString()}</p>
                               <p className={cn("text-[11px] font-bold uppercase mt-3", v.stock > 0 ? "text-emerald-500" : "text-red-500")}>
                                 {v.stock > 0 ? `${v.stock} Units In Stock` : 'Currently Sold Out'}
                               </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                 </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">GHS</span>
                  <span className="text-6xl font-black text-slate-900 italic tracking-tighter transition-all duration-500">
                    {displayPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2">
                 <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", inStock ? "bg-emerald-500" : "bg-red-500")} />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{inStock ? 'Available for Dispatch' : 'Out of Stock'}</span>
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3" /> Warranty: {product.warranty}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
               <Button 
                 onClick={handleAddToCart} 
                 className="w-full h-20 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 text-xl uppercase tracking-[0.2em] hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 gap-4"
                 disabled={!inStock || isAdding}
               >
                 {isAdding ? <Loader2 className="w-7 h-7 animate-spin" /> : !inStock ? "Currently Sold Out" : <><ShoppingCart className="w-7 h-7" /> Add selection to Cart</>}
               </Button>
               
               <div className="flex items-center justify-center gap-8 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Truck className="w-3 h-3 text-blue-500" /> Free Accra Delivery</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Pay on Receipt (Accra)</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-20 border-t border-slate-100">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                  <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 italic">About this Item</h2>
               </div>
               <p className="text-xl text-slate-600 leading-relaxed font-medium whitespace-pre-wrap px-2">
                 {product.description || "No detailed description provided."}
               </p>
            </div>

            <div className="min-h-[200px]" />
          </div>

          <div className="lg:col-span-4">
             <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-950 text-white p-10 space-y-10 sticky top-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                <h3 className="text-xl font-black uppercase italic relative z-10">Safe <span className="text-blue-500">Shopping</span></h3>
                
                <div className="space-y-8 relative z-10">
                   <div className="flex gap-5">
                      <div className="p-3 bg-white/5 rounded-2xl text-blue-500 border border-white/10 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                      <div>
                         <p className="font-black uppercase text-[10px] text-white/40 tracking-widest mb-1">Authentic Goods</p>
                         <p className="text-sm font-medium leading-relaxed">Every item in our marketplace is verified for quality and performance.</p>
                      </div>
                   </div>
                   <div className="flex gap-5">
                      <div className="p-3 bg-white/5 rounded-2xl text-blue-500 border border-white/10 shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                      <div>
                         <p className="font-black uppercase text-[10px] text-white/40 tracking-widest mb-1">Secure Delivery</p>
                         <p className="text-sm font-medium leading-relaxed">Fast and tracked logistics ensuring your purchase reaches you safely.</p>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-white/10 relative z-10">
                   <p className="text-center font-black italic text-blue-500 text-sm">"All You Need, All For You"</p>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
