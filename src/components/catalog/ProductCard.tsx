"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap } from "lucide-react";
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

  // Random rotation effect
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = Math.floor(Math.random() * images.length);
        // Ensure we don't pick the same one twice in a row if possible
        return nextIndex === prev ? (nextIndex + 1) % images.length : nextIndex;
      });
    }, 4000);

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

  const getCategoryIcon = () => {
    switch (product.category) {
      case "Laptops": 
        return (
          <div className="relative w-4 h-4">
            <Image 
              src="https://i.ibb.co/nMy2cj24/dell-icon-11-removebg-preview.png" 
              alt="Laptops" 
              fill 
              className="object-contain"
            />
          </div>
        );
      case "Phones": 
        return (
          <div className="relative w-4 h-4">
            <Image 
              src="https://i.ibb.co/WvdsfcTh/Samsung-Galaxy-S24-Ultra-Titanium-Violet-Smartphone-transparent-PNG-image-300x300-removebg-preview.png" 
              alt="Phones" 
              fill 
              className="object-contain"
            />
          </div>
        );
      case "Closet": 
        return (
          <div className="relative w-4 h-4">
            <Image 
              src="https://i.ibb.co/MxNHbcw2/Armor-Hoodie-Black-01-removebg-preview.png" 
              alt="Closet" 
              fill 
              className="object-contain"
            />
          </div>
        );
      case "Accessories": 
        return (
          <div className="relative w-4 h-4">
            <Image 
              src="https://i.ibb.co/qFn4CMBf/hd-blue-apple-smart-watch-series-6-png-704081694622170ogfulucxw5-removebg-preview.png" 
              alt="Accessories" 
              fill 
              className="object-contain"
            />
          </div>
        );
      case "Educational Consult": 
        return (
          <div className="relative w-4 h-4">
            <Image 
              src="https://i.ibb.co/pB4yX4JL/high-resolution-graduation-cap-png-icon-17-removebg-preview.png" 
              alt="Educational Consult" 
              fill 
              className="object-contain"
            />
          </div>
        );
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getBadgeInfo = () => {
    if (product.category === "Closet") return product.size || "Universal";
    if (product.category === "Laptops") return product.ram_size || "Standard";
    if (product.category === "Phones") return product.storage_size || "Standard";
    if (product.category === "Educational Consult") return "Consultancy";
    return null;
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
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white border-none text-[8px] font-bold uppercase">
              Low Stock
            </Badge>
          )}
          {showCategory && (
            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase flex items-center gap-1.5 py-1 px-2.5">
              {getCategoryIcon()} {product.category.split(' ')[0]}
            </Badge>
          )}
        </div>
      </Link>

      <button onClick={handleToggleWishlist} className={cn("absolute top-6 right-6 p-2 rounded-full border bg-white/80 backdrop-blur-md transition-all z-10", isFavorite ? "text-red-500 bg-red-50" : "text-slate-400")}>
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </button>

      <div className="flex flex-col flex-1 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-sm text-slate-900 leading-snug">{product.name}</h3>
            {getBadgeInfo() && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">{getBadgeInfo()}</span>}
          </div>
          <p className="text-xl md:text-2xl font-bold text-primary font-headline">GH₵{product.price.toLocaleString()}</p>
        </div>

        <Button onClick={handleAdd} disabled={product.stock <= 0} className="w-full mt-auto rounded-xl h-10 font-bold bg-slate-900 text-white hover:bg-primary transition-all text-[10px] uppercase tracking-widest">
          {product.stock <= 0 ? "Unavailable" : "Add to Order"}
        </Button>
      </div>
    </div>
  );
}
