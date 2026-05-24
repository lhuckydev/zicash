
"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 pb-24 md:pb-12">
          <div className="p-8 bg-slate-50 rounded-full border border-slate-100">
            <Heart className="w-16 h-16 text-slate-300" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Your wishlist is empty</h1>
            <p className="text-slate-500 font-medium">Save items you like for later browsing.</p>
          </div>
          <Link href="/">
            <Button size="lg" className="bg-primary px-8 font-bold">
              Explore Products
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12 pb-24 md:pb-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My <span className="text-primary italic">Favorites</span></h1>
            <p className="text-slate-500 font-medium mt-1">Items you've bookmarked for later.</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="hidden md:flex gap-2 font-bold rounded-xl border-slate-200">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
