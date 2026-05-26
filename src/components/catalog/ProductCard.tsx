"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, useCartStore, getEffectivePrice, isDiscountActive } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Tag } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ProductCard({ 
  product, 
  showCategory = true 
}: { 
  product: Product; 
  showCategory?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const { toast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [product.image_url];

  const isFavorite = hasItem(product.id);
  const activeDiscount = isDiscountActive(product);
  const effectivePrice = getEffectivePrice(product);
  
  const discountPercent = activeDiscount 
    ? Math.round(((product.price - effectivePrice) / product.price) * 100)
    : 0;

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({ title: "Added to order", description: `${product.name} ready for checkout.` });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <div className="group bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-slate-100 flex flex-col h-full relative">
      <Link href={`/product/${product.id}`} className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 mb-5">
        <Image 
          src={images[currentImageIndex]} 
          alt={product.name} 
          fill 
          sizes="(max-width: 768px) 50vw, 33vw" 
          className="object-contain p-6 transition-all duration-1000 group-hover:scale-105" 
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {activeDiscount && (
            <Badge className="bg-blue-600 text-white border-none text-[8px] font-black uppercase flex items-center gap-1.5 py-1.5 px-3 shadow-lg shadow-blue-500/20 animate-in zoom-in duration-300">
              <Tag className="w-2.5 h-2.5" /> Save {discountPercent}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white border-none text-[8px] font-black uppercase px-3 py-1.5">
              Limited Stock
            </Badge>
          )}
        </div>
      </Link>

      <button onClick={handleToggleWishlist} className={cn("absolute top-7 right-7 p-2.5 rounded-full border bg-white/90 backdrop-blur-md transition-all z-10 hover:scale-110 shadow-sm", isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 border-slate-100 hover:text-slate-600")}>
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </button>

      <div className="flex flex-col flex-1 space-y-4 px-1">
        <div className="space-y-1.5">
          <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">{product.name}</h3>
          <div className="flex flex-col">
             {activeDiscount && (
               <p className="text-[10px] text-slate-400 font-bold line-through mb-0.5">WAS GH₵ {product.price.toLocaleString()}</p>
             )}
             <p className="text-xl font-black text-blue-600 font-headline italic tracking-tighter">GH₵ {effectivePrice.toLocaleString()}</p>
          </div>
        </div>

        <Button onClick={handleAdd} disabled={product.stock <= 0} className="w-full mt-auto rounded-xl h-11 font-black bg-slate-950 text-white hover:bg-blue-600 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/5 active:scale-95">
          {product.stock <= 0 ? "Out of Stock" : "Add to Order"}
        </Button>
      </div>
    </div>
  );
}
