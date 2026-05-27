"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronRight, Star, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { cardHover, buttonTap } from "@/lib/animations";
import { supabase } from "@/lib/supabase";

const CardTimer = ({ expiryDate }: { expiryDate: string }) => {
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
    <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100 w-fit">
      <Clock className="w-3 h-3 animate-pulse" />
      <span className="text-[8px] font-black uppercase tracking-widest">
        Ends: {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
      </span>
    </div>
  );
};

export function ProductCard({ 
  product, 
  showCategory = true 
}: { 
  product: Product; 
  showCategory?: boolean;
}) {
  const { toggleItem, hasItem } = useWishlistStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ratingInfo, setRatingInfo] = useState<{ average: number; count: number } | null>(null);
  
  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [product.image_url];

  const isFavorite = hasItem(product.id);
  
  const discountActive = product.variants?.some(v => v.discount_price && v.discount_price > 0) || (product.discount_price && product.discount_price > 0);
  const hasVariants = product.variants && product.variants.length > 1;

  // Find the earliest expiry date for the timer
  const earliestExpiry = product.variants
    ? product.variants
        .filter(v => v.discount_ends_at && v.discount_price)
        .map(v => v.discount_ends_at!)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
    : product.discount_ends_at;

  const displayPrice = product.variants && product.variants.length > 0 
    ? Math.min(...product.variants.map(v => (v.discount_price && v.discount_price > 0) ? v.discount_price : v.price))
    : (product.discount_price || product.price);

  const originalPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price))
    : product.price;

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    async function fetchRatings() {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);
      
      if (data && data.length > 0) {
        const average = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
        setRatingInfo({ average, count: data.length });
      }
    }
    fetchRatings();
  }, [product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  // Only hide price if it has more than one variant AND is currently discounted
  const showPriceLine = !(hasVariants && discountActive);

  return (
    <motion.div 
      {...cardHover}
      className={cn(
        "group bg-white rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-4 transition-all duration-500 hover:shadow-2xl border flex flex-col h-full relative",
        discountActive ? "border-red-500/30 shadow-red-500/5 bg-red-50/[0.02]" : "border-transparent hover:border-slate-100"
      )}
    >
      <Link href={`/product/${product.id}`} className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-50 mb-4 md:mb-5">
        <Image 
          src={images[currentImageIndex]} 
          alt={product.name} 
          fill 
          sizes="(max-width: 768px) 50vw, 33vw" 
          className="object-contain p-4 md:p-6 transition-all duration-1000 group-hover:scale-110" 
        />
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1">
          {discountActive && (
            <Badge className="bg-red-600 text-white border-none text-[7px] md:text-[8px] font-black uppercase flex items-center gap-1 py-1 px-2 md:py-1.5 md:px-3 shadow-lg shadow-red-500/20">
              <Zap className="w-2.5 h-2.5 md:w-3 h-3 fill-current" /> Hot Deal
            </Badge>
          )}
          {hasVariants && (
            <Badge className="bg-blue-600 text-white border-none text-[7px] md:text-[8px] font-black uppercase flex items-center gap-1 py-1 px-2 md:py-1.5 md:px-3 shadow-lg shadow-blue-500/20">
              More Choices
            </Badge>
          )}
        </div>
      </Link>

      <motion.button 
        {...buttonTap}
        onClick={handleToggleWishlist} 
        className={cn(
          "absolute top-5 right-5 md:top-7 md:right-7 p-2 md:p-2.5 rounded-full border bg-white/90 backdrop-blur-md transition-all z-10 hover:scale-110 shadow-sm", 
          isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-300 border-slate-100 hover:text-slate-600"
        )}
      >
        <Heart className={cn("w-3.5 h-3.5 md:w-4 h-4", isFavorite && "fill-current")} />
      </motion.button>

      <div className="flex flex-col flex-1 space-y-3 md:space-y-4 px-0.5">
        <div className="space-y-1 md:space-y-1.5">
          {product.brand && (
            <p className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", discountActive ? "text-red-600" : "text-blue-600")}>{product.brand}</p>
          )}
          <h3 className="font-bold text-xs md:text-sm text-slate-900 leading-snug line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] group-hover:text-blue-600 transition-colors uppercase">{product.name}</h3>
          
          <div className="flex items-center gap-2 md:gap-3">
             <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("w-2.5 h-2.5 md:w-3 h-3", (ratingInfo?.average || 0) >= s ? "fill-current" : "opacity-20")} />
                ))}
             </div>
             {ratingInfo && (
               <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">({ratingInfo.count})</span>
             )}
          </div>

          <div className="flex flex-col pt-1 min-h-[45px] md:min-h-[50px] justify-center">
             {showPriceLine ? (
               <div className="space-y-0.5">
                 {discountActive && (
                   <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest line-through opacity-60">GHS {originalPrice.toLocaleString()}</p>
                 )}
                 <p className={cn("text-lg md:text-xl font-black font-headline italic tracking-tighter", discountActive ? "text-red-600" : "text-blue-600")}>
                   GH₵ {displayPrice.toLocaleString()}
                 </p>
               </div>
             ) : (
               <div className="py-1">
                 {earliestExpiry && <CardTimer expiryDate={earliestExpiry} />}
               </div>
             )}
          </div>
        </div>

        <motion.div {...buttonTap} className="mt-auto">
          <Link href={`/product/${product.id}`} className="block">
            <Button className={cn(
              "w-full rounded-xl h-10 md:h-11 font-black text-white transition-all text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl active:scale-95 gap-2",
              discountActive ? "bg-red-600 hover:bg-red-700 shadow-red-900/5" : "bg-slate-950 hover:bg-blue-600 shadow-slate-900/5"
            )}>
              {hasVariants ? "Explore Options" : "View Details"} <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
