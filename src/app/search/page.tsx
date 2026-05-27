
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Frown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))');

      if (data) {
        const filtered = data.filter((p: Product) => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
        );
        setProducts(filtered);
      }
      setIsLoading(false);
    }
    fetchResults();
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Search <span className="text-blue-600">Results</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isLoading ? "Searching catalog..." : `${products.length} items found for "${query}"`}
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" className="font-bold text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin opacity-20" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="p-6 bg-slate-50 rounded-full mb-6">
            <Frown className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No matches found</h3>
          <p className="text-slate-500 max-w-xs mt-2 font-medium px-6">
            We couldn't find any products matching your search. Try different keywords.
          </p>
          <Link href="/">
            <Button className="mt-8 bg-blue-600 font-bold px-8">Browse All Products</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12 pb-24 md:pb-12">
        <Suspense fallback={<div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" /></div>}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
