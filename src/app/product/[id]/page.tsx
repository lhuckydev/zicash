"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Product, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { 
  ArrowLeft, Heart, ShieldCheck, Truck, Cpu, Database, 
  CircuitBoard, Monitor, Smartphone, Shirt, 
  Zap, Palette, Timer, 
  Video, Layers, Info,  
  ShoppingCart, Star, Loader2
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
import { Skeleton } from "@/components/ui/skeleton";

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

function ProductPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-5 flex flex-col md:flex-row gap-6">
          <div className="order-2 md:order-1 flex md:flex-col gap-3 md:w-20">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
          <Skeleton className="flex-1 order-1 md:order-2 aspect-square rounded-[2.5rem]" />
        </div>
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="flex-1 h-32 rounded-[2rem]" />
            <Skeleton className="flex-1 h-32 rounded-[2rem]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, hasItem } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) {
          toast({ variant: "destructive", title: "Error", description: "Product not found." });
          router.push("/");
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id, router, toast]);

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
    addItem(product as any);
    toast({ title: "Added to Order", description: `${product.name} added to your basket.` });
    setTimeout(() => setIsAdding(false), 500);
  };

  const isFavorite = product ? hasItem(product.id) : false;

  const productImages = (product?.image_urls?.length ? product.image_urls : [product?.image_url]).filter(Boolean);

  if (!isLoading && !product) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-12 text-slate-900">
        {isLoading ? (
          <ProductPageSkeleton />
        ) : (
          <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Back To Marketplace
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-5 flex flex-col md:flex-row gap-6">
                <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide shrink-0 md:w-20 pb-2 md:pb-0">
                  {productImages.map((url, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleThumbnailClick(idx)}
                      className={cn(
                        "relative aspect-square w-16 md:w-full rounded-2xl border-2 overflow-hidden bg-slate-50 cursor-pointer transition-all shrink-0",
                        current === idx ? "border-blue-600 ring-4 ring-blue-500/10" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image src={url as string} alt={`View ${idx + 1}`} fill className="object-contain p-2" />
                    </div>
                  ))}
                </div>

                <div className="flex-1 order-1 md:order-2 relative aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-sm group border border-slate-100">
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
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                     <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-none font-black uppercase text-[8px] tracking-widest px-3 py-1 shadow-sm">Verified Unit</Badge>
                     {product && product.stock <= 5 && product.stock > 0 && <Badge className="bg-orange-500 text-white border-none font-black uppercase text-[8px] tracking-widest px-3 py-1 shadow-sm">Limited Stock</Badge>}
                  </div>

                  <button 
                    onClick={() => product && toggleItem(product)} 
                    className={cn(
                      "absolute top-6 right-6 p-3 rounded-full border shadow-xl transition-all z-20 hover:scale-110 active:scale-95",
                      isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-300 bg-white/90 border-slate-100"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{product?.category} / {product?.brand}</p>
                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 font-headline tracking-tight leading-tight uppercase">
                    {product?.name}
                  </h1>
                  <div className="flex items-center gap-3">
                     <div className="flex text-amber-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Quality Node</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4 shadow-inner">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20"><ShieldCheck className="w-5 h-5" /></div>
                       <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.15em]">ZiCash Quality Node</h3>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">This unit has been tested and certified for peak performance.</p>
                  </div>
                  <div className="flex-1 p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 space-y-4 shadow-inner">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20"><Truck className="w-5 h-5" /></div>
                       <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.15em]">Delivery Network</h3>
                     </div>
                     <p className="text-emerald-700 text-sm leading-relaxed font-medium">Free express delivery within the Accra metropolis available.</p>
                  </div>
                </div>

                <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price in GHS</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">GHS</span>
                      <span className="text-5xl font-black text-slate-900 italic tracking-tighter">{product?.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                     <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", (product?.stock || 0) > 0 ? "bg-blue-500" : "bg-red-500")} />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(product?.stock || 0) > 0 ? `${product?.stock} Units In Stock` : "Out of Stock"}</span>
                  </div>
                </div>

                <div className="space-y-6">
                   <Button 
                     onClick={handleAddToCart} 
                     className="w-full h-16 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 text-lg uppercase tracking-[0.15em] hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 gap-3"
                     disabled={(product?.stock || 0) <= 0 || isAdding}
                   >
                     {isAdding ? <Loader2 className="w-6 h-6 animate-spin" /> : (product?.stock || 0) <= 0 ? "Out of Stock" : <><ShoppingCart className="w-6 h-6" /> Add to Order</>}
                   </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-20 border-t border-slate-100">
              <div className="lg:col-span-8 space-y-16">
                <div className="space-y-6">
                   <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 italic">Product Description</h2>
                   <p className="text-lg text-slate-600 leading-relaxed font-medium">{product?.specs.split('|')[0]}</p>
                </div>

                <div className="space-y-8">
                   <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 italic">Technical Specifications</h2>
                   <div className="bg-slate-50/50 rounded-[3rem] border border-slate-100 p-8 md:p-14 shadow-inner">
                     <Table>
                       <TableBody>
                         {product?.category === "Laptops" && (
                           <>
                             <TechTableRow icon={Cpu} label="System Processor" value={product.cpu} />
                             <TechTableRow icon={Timer} label="Operation Speed" value={product.clock_speed} />
                             <TechTableRow icon={CircuitBoard} label="Memory (RAM)" value={product.ram_size} />
                             <TechTableRow icon={Database} label="Storage Space" value={product.storage_size} />
                             <TechTableRow icon={Monitor} label="Display Resolution" value={product.screen_resolution} />
                             <TechTableRow icon={Layers} label="Graphics Node" value={product.gpu} />
                             <TechTableRow icon={ShieldCheck} label="Physical Condition" value={product.condition} />
                           </>
                         )}
                         {product?.category === "Phones" && (
                           <>
                             <TechTableRow icon={Cpu} label="System Chipset" value={product.cpu} />
                             <TechTableRow icon={CircuitBoard} label="Memory Node" value={product.ram_size} />
                             <TechTableRow icon={Database} label="Storage Capacity" value={product.storage_size} />
                             <TechTableRow icon={Smartphone} label="Battery Performance" value={product.battery} />
                             <TechTableRow icon={Video} label="Camera Array" value={product.camera} />
                             <TechTableRow icon={ShieldCheck} label="Physical Condition" value={product.condition} />
                           </>
                         )}
                       </TableBody>
                     </Table>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
