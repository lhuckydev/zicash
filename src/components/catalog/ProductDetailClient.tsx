"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariant, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { 
  ArrowLeft, Heart, ShieldCheck, Truck, Cpu, Database, 
  CircuitBoard, Monitor, Smartphone, 
  Zap, Timer, 
  Video, Layers, Info,  
  ShoppingCart, Star, Loader2, Tag, ChevronRight, CheckCircle2,
  Box, Maximize, SmartphoneIcon, Camera, MousePointer2
} from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  type CarouselApi
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function TechTableRow({ icon: Icon, label, value }: { icon: any, label: string, value: any }) {
  if (!value || value === "N/A" || value === "") return null;
  return (
    <TableRow className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
      <TableCell className="py-5 pl-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        </div>
      </TableCell>
      <TableCell className="py-5 text-right pr-0">
        <span className="text-sm font-black text-slate-900 italic tracking-tight">{value}</span>
      </TableCell>
    </TableRow>
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

  useEffect(() => {
    async function fetchFullProduct() {
      const { data, error } = await (await import('@/lib/supabase')).supabase
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

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    addItem(product, selectedVariant);
    toast({ 
      title: "Added to Order", 
      description: `${product.name} (${selectedVariant?.label || 'Standard'}) added to your basket.` 
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
                   <Badge className="bg-slate-900 text-white border-none font-black uppercase text-[9px] tracking-widest px-4 py-2 shadow-xl">Top Performance Unit</Badge>
                 )}
                 <Badge className="bg-blue-600/10 backdrop-blur-md text-blue-600 border-none font-black uppercase text-[8px] tracking-widest px-3 py-1 shadow-sm">Verified Hardware</Badge>
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
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category} Section</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                 <div className="flex text-amber-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified Performance</span>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">1. Select Configuration</h3>
                    <Badge variant="outline" className="text-[9px] font-bold text-slate-400 rounded-lg">{product.variants.length} Options Available</Badge>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.variants.map((v) => {
                      const isActive = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "text-left p-5 rounded-2xl border-2 transition-all group relative overflow-hidden",
                            isActive 
                              ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-600/5 shadow-md" 
                              : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 shadow-sm"
                          )}
                        >
                          {isActive && <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 flex items-center justify-center rounded-bl-xl text-white shadow-lg"><CheckCircle2 className="w-4 h-4" /></div>}
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isActive ? "text-blue-600" : "text-slate-400")}>{v.condition || 'New'}</p>
                          <h4 className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">{v.label}</h4>
                          <div className="mt-3 flex items-center justify-between">
                             <p className="text-xs font-black text-blue-600 italic tracking-tighter">GH₵ {v.price.toLocaleString()}</p>
                             <p className={cn("text-[8px] font-bold uppercase", v.stock > 0 ? "text-emerald-500" : "text-red-500")}>
                               {v.stock > 0 ? `${v.stock} Units In Stock` : 'Out of Stock'}
                             </p>
                          </div>
                        </button>
                      );
                    })}
                 </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</p>
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
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{inStock ? 'Archive Availability: Confirmed' : 'Archive Availability: Exhausted'}</span>
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3" /> Warranty Node: {product.warranty}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
               <Button 
                 onClick={handleAddToCart} 
                 className="w-full h-20 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 text-xl uppercase tracking-[0.2em] hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 gap-4"
                 disabled={!inStock || isAdding}
               >
                 {isAdding ? <Loader2 className="w-7 h-7 animate-spin" /> : !inStock ? "Archival Sync Failed (Out of Stock)" : <><ShoppingCart className="w-7 h-7" /> Add Configuration to Order</>}
               </Button>
               
               <div className="flex items-center justify-center gap-8 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Truck className="w-3 h-3 text-blue-500" /> Free Accra Delivery</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Payment on Receipt (Accra)</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-20 border-t border-slate-100">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                  <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 italic">Descriptive Metadata</h2>
               </div>
               <p className="text-xl text-slate-600 leading-relaxed font-medium whitespace-pre-wrap px-2">
                 {product.description || "The high-performance hardware unit is currently undergoing final data verification."}
               </p>
            </div>

            {!isSimpleCategory && (
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 italic">Hardware Schematics</h2>
                 </div>
                 <div className="bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-16 shadow-xl shadow-blue-600/5">
                   <Table>
                     <TableBody>
                       {product.category === "Laptops" && (
                         <>
                           <TechTableRow icon={Cpu} label="System Processor" value={selectedVariant?.cpu || product.advanced_specs?.cpu} />
                           <TechTableRow icon={CircuitBoard} label="Memory (RAM)" value={selectedVariant?.ram || product.advanced_specs?.ram} />
                           <TechTableRow icon={Database} label="Archive Storage" value={selectedVariant?.storage || product.advanced_specs?.storage} />
                           <TechTableRow icon={Layers} label="Graphics Node" value={selectedVariant?.gpu || product.advanced_specs?.gpu} />
                           <TechTableRow icon={Maximize} label="Display Real-estate" value={selectedVariant?.screen || product.advanced_specs?.res} />
                           <TechTableRow icon={Zap} label="Touch Interface" value={selectedVariant?.touchscreen ? "Capacitive Multi-touch Enabled" : "Standard Interface"} />
                           <TechTableRow icon={Monitor} label="Physical Condition" value={selectedVariant?.condition || "Verified Tier 1"} />
                           <TechTableRow icon={Info} label="I/O Matrix" value={product.advanced_specs?.ports} />
                           <TechTableRow icon={Zap} label="Operating System" value={product.advanced_specs?.os} />
                           <TechTableRow icon={Box} label="Audio System" value={product.advanced_specs?.audio} />
                         </>
                       )}
                       {product.category === "Phones" && (
                         <>
                           <TechTableRow icon={SmartphoneIcon} label="Processing Chipset" value={selectedVariant?.chipset || product.advanced_specs?.chipset} />
                           <TechTableRow icon={CircuitBoard} label="System Memory" value={selectedVariant?.ram || product.advanced_specs?.ram} />
                           <TechTableRow icon={Database} label="Storage Capacity" value={selectedVariant?.storage || product.advanced_specs?.storage} />
                           <TechTableRow icon={Smartphone} label="Battery Node" value={selectedVariant?.battery || product.advanced_specs?.charge} />
                           <TechTableRow icon={Video} label="Primary Optics" value={product.advanced_specs?.camera} />
                           <TechTableRow icon={Zap} label="Refresh Dynamics" value={product.advanced_specs?.refresh} />
                           <TechTableRow icon={Monitor} label="Structural Integrity" value={selectedVariant?.condition || "Verified Tier 1"} />
                           <TechTableRow icon={ShieldCheck} label="IP Resilience" value={product.advanced_specs?.rating} />
                         </>
                       )}
                     </TableBody>
                   </Table>
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
             <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-950 text-white p-10 space-y-10 sticky top-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                <h3 className="text-xl font-black uppercase italic relative z-10">Purchase <span className="text-blue-500">Security</span></h3>
                
                <div className="space-y-8 relative z-10">
                   <div className="flex gap-5">
                      <div className="p-3 bg-white/5 rounded-2xl text-blue-500 border border-white/10 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                      <div>
                         <p className="font-black uppercase text-[10px] text-white/40 tracking-widest mb-1">Authenticity Check</p>
                         <p className="text-sm font-medium leading-relaxed">Every hardware unit is verified for genuine components and serialized tracking.</p>
                      </div>
                   </div>
                   <div className="flex gap-5">
                      <div className="p-3 bg-white/5 rounded-2xl text-blue-500 border border-white/10 shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                      <div>
                         <p className="font-black uppercase text-[10px] text-white/40 tracking-widest mb-1">Receipt Archiving</p>
                         <p className="text-sm font-medium leading-relaxed">Your digital invoice is generated and archived immediately upon transaction confirmation.</p>
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