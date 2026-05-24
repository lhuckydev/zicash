"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Zap, Award, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AboutPage() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRandomProductImage() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('image_url');
        
        if (!error && data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setHeroImage(data[randomIndex].image_url);
        }
      } catch (err) {
        console.error("About Page: Image sync error", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRandomProductImage();
  }, []);

  const displayImage = heroImage || "https://picsum.photos/seed/zicash-market/800/600";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pb-24 md:pb-12 bg-slate-50 tech-grid">
        <div className="container mx-auto px-6 py-12 md:py-24 space-y-20">
          
          {/* Hero Identity Section */}
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 overflow-hidden rounded-3xl shadow-2xl border-4 border-white bg-white">
                <Image 
                  src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                  alt="ZiCash GH Limited" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 font-headline uppercase italic">
                  Zi<span className="text-blue-600">Cash GH Limited</span>
                </h1>
                <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mt-1">Premium Online Marketplace</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
                "All You Need, <span className="text-blue-600 italic underline decoration-blue-200 underline-offset-8">All For You</span>"
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-3xl">
                ZiCash GH Limited is Ghana's premier destination for high-quality goods and professional services. We curate the best in technology, fashion, and education to ensure excellence is accessible to everyone.
              </p>
            </div>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Premium Quality", text: "We only source products that meet the highest standards of quality, utility, and aesthetic value.", color: "blue" },
              { icon: ShieldCheck, title: "Trusted Verification", text: "Every item in our marketplace undergoes a strict evaluation before being offered to our community.", color: "emerald" },
              { icon: Award, title: "Client Satisfaction", text: "Our commitment to you continues long after your purchase. We are your partners in finding what you need.", color: "orange" }
            ].map((pillar, i) => (
              <div key={i} className="p-10 bg-white rounded-[2.5rem] space-y-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform duration-500">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  pillar.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                  pillar.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                  'bg-orange-50 text-orange-600'
                }`}>
                  <pillar.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black font-headline uppercase tracking-tight italic">{pillar.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-slate-200 pt-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                Our Strategic Vision
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Empowering <span className="text-blue-600">The Modern Lifestyle</span></h2>
              <div className="space-y-4 text-slate-600 font-medium">
                <p>At ZiCash GH Limited, we believe that access to quality tools and lifestyle essentials is a catalyst for progress. Whether you are seeking professional equipment or personal style, we provide the infrastructure you need to thrive.</p>
                <p>Our marketplace is a dynamic hub, constantly updated with the latest innovations and curated selections across multiple departments.</p>
              </div>
              <div className="flex gap-4">
                <Link href="/categories">
                  <button className="h-14 px-8 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">Explore Catalog</button>
                </Link>
                <Link href="/contact">
                  <button className="h-14 px-8 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">Support Center</button>
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-200 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin opacity-20" />
              ) : (
                <>
                  <Image 
                    src={displayImage} 
                    alt="ZiCash Marketplace Highlight" 
                    fill 
                    className="object-contain p-8 md:p-12"
                    data-ai-hint="product highlight"
                  />
                  <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
                </>
              )}
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
