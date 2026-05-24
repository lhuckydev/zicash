"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product } from "@/store/useCartStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .limit(4);

        if (supabaseError) {
          setError(supabaseError.message || "Failed to fetch products. Check database connectivity.");
        } else {
          setProducts(data || []);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while accessing the database.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold">Premium Selections</h2>
            <p className="text-muted-foreground max-w-xl">
              Hand-picked inventory items for your lifestyle and workspace. Verified for performance and aesthetic dominance.
            </p>
          </div>
          <Link href="/categories">
            <Button variant="link" className="text-primary font-bold p-0 flex items-center gap-2 group">
              Browse All Categories <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {error ? (
          <Alert variant="destructive" className="max-w-2xl mx-auto glass-panel border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Link Failure</AlertTitle>
            <AlertDescription className="mt-2 text-xs opacity-90 leading-relaxed">
              {error.includes("relation \"products\" does not exist") 
                ? "The 'products' table has not been initialized. Please ensure the marketplace database is synchronized." 
                : `Error Details: ${error}`}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Awaiting procurement sync...</p>
          </div>
        )}
      </div>
    </section>
  );
}
