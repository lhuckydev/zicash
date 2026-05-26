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
    toast({ title: "Added to cart", description: `${product.name} ready for checkout.` });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <div className="group bg-white rounded-3xl p-4 transition-all duration-300 hover:shadow-xl border border-transparent hover:border-slate-100 flex flex-col h-full relative">
      <Link href={`/product/${product.id}`} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
        <Image 
          src={images[currentImageIndex]} 
          alt={product.name} 
          fill 
          sizes="33vw" 
          className="object-contain p-4 transition-all duration-1000 group-hover:scale-105" 
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {activeDiscount && (
            <Badge className="bg-blue-600 text-white border-none text-[8px] font-black uppercase flex items-center gap-1 py-1 px-2.5 shadow-lg shadow-blue-500/20 animate-bounce">
              <Tag className="w-2.5 h-2.5" /> Limited Deal
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white border-none text-[8px] font-bold uppercase">
              Low Stock
            </Badge>
          )}
        </div>
      </Link>

      <button onClick={handleToggleWishlist} className={cn("absolute top-6 right-6 p-2 rounded-full border bg-white/80 backdrop-blur-md transition-all z-10", isFavorite ? "text-red-500 bg-red-50" : "text-slate-400")}>
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </button>

      <div className="flex flex-col flex-1 space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{product.name}</h3>
          <div className="flex items-baseline gap-2">
             <p className="text-xl font-bold text-primary font-headline italic">GH₵{effectivePrice.toLocaleString()}</p>
             {activeDiscount && (
               <p className="text-[10px] text-slate-400 font-bold line-through">GH₵{product.price.toLocaleString()}</p>
             )}
          </div>
        </div>

        <Button onClick={handleAdd} disabled={product.stock <= 0} className="w-full mt-auto rounded-xl h-10 font-bold bg-slate-900 text-white hover:bg-primary transition-all text-[10px] uppercase tracking-widest">
          {product.stock <= 0 ? "Unavailable" : "Add to Order"}
        </Button>
      </div>
    </div>
  );
}
