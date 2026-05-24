import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, MousePointer2, ShieldCheck, Sparkles } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-laptop');

  return (
    <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-slate-50">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New Arrivals in Marketplace
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900">
              Premium Shopping <br />
              For <span className="text-primary italic">Every Need</span>.
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Discover a curated selection of technology, lifestyle essentials, and professional services. At ZiCash, we bring quality and reliability to your doorstep.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link href="/categories">
                <Button size="lg" className="rounded-xl px-8 py-6 h-auto text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  Shop Catalog <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/suggested">
                <Button variant="outline" size="lg" className="rounded-xl px-8 py-6 h-auto text-lg font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-900">
                  <Sparkles className="mr-2 w-5 h-5 text-blue-600" /> Best Deals
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <ShoppingBag className="w-4 h-4 text-primary" /> Verified Goods
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <ShieldCheck className="w-4 h-4 text-primary" /> Expert Support
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square max-w-[600px]">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full translate-x-12 translate-y-12 opacity-50"></div>
            <div className="relative border border-slate-200 rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image 
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/market/1200/800"} 
                  alt="ZiCash Marketplace Spotlight"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  data-ai-hint="premium product"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 text-left">ZiCash Marketplace</h3>
                    <p className="text-sm text-slate-500 font-medium text-left">Quality. Reliability. Value.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary font-bold">STARTING AT</p>
                    <p className="text-2xl font-bold text-slate-900">GHS 299</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
