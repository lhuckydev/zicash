"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Zap, Award, Loader2, ShoppingBag, MessageCircle, Globe, History, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer } from "@/lib/animations";

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
        console.error("About Page: Image update error", err);
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
          <motion.div 
            variants={staggerContainer(0.1)}
            initial="initial"
            animate="animate"
            className="max-w-4xl space-y-8"
          >
            <motion.div variants={slideUp} className="flex items-center gap-5">
              <div className="relative w-20 h-20 overflow-hidden rounded-3xl shadow-2xl border-4 border-white bg-white">
                <Image 
                  src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                  alt="ZiCash GH Limited" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[9px] uppercase tracking-widest px-3">Est. 2022</Badge>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 font-headline uppercase italic">
                  Zi<span className="text-blue-600">Cash GH Limited</span>
                </h1>
                <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mt-1">Quality & Reliability Personified</p>
              </div>
            </motion.div>
            
            <motion.div variants={slideUp} className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
                "All You Need, <span className="text-blue-600 italic underline decoration-blue-200 underline-offset-8">All For You</span>"
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-3xl italic border-l-4 border-blue-600 pl-6 py-2 bg-white/50 rounded-r-2xl">
                Founded with a vision to simplify access to quality technology and trusted services, ZiCash began as a customer-focused online business providing reliable phones, laptops, and gadgets.
              </p>
            </motion.div>
          </motion.div>

          {/* Our Story Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <motion.div variants={fadeIn} className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                  <History className="w-3 h-3" /> Our Story
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">From Trust to <span className="text-blue-600">Marketplace</span></h2>
                <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
                   <p>ZiCash was created with one simple goal: to make quality gadgets, digital services, and everyday products more accessible, reliable, and convenient. What started as an online business built on trust and direct customer relationships has grown into a one-stop digital shop.</p>
                   <p>We started by serving customers directly through <span className="text-emerald-600 font-bold">WhatsApp</span>, building trust one customer at a time. Today, ZiCash continues to grow with the same mission: to provide convenience, quality, and reliability in one place.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Establishment</p>
                      <p className="text-2xl font-black text-slate-900">2022</p>
                   </div>
                   <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Satisfied Clients</p>
                      <p className="text-2xl font-black text-slate-900">1000+</p>
                   </div>
                </div>
             </motion.div>
             
             <motion.div variants={fadeIn} className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-200 flex items-center justify-center group">
               {isLoading ? (
                 <Loader2 className="w-10 h-10 text-blue-600 animate-spin opacity-20" />
               ) : (
                 <>
                   <Image 
                     src={displayImage} 
                     alt="ZiCash Shop Highlight" 
                     fill 
                     className="object-contain p-12 transition-transform duration-1000 group-hover:scale-110"
                     data-ai-hint="product highlight"
                   />
                   <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
                 </>
               )}
             </motion.div>
          </div>

          {/* Special Focus Section */}
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full -mr-48 -mt-48" />
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                   <h3 className="text-3xl md:text-5xl font-black uppercase italic leading-tight">Beyond just <span className="text-blue-500">Hardware</span>.</h3>
                   <p className="text-slate-400 font-medium text-lg leading-relaxed">
                     At ZiCash, we understand that customers want quality products, affordable prices, and honest service. That is why we focus on providing both brand-new and carefully selected refurbished devices, alongside trusted digital services.
                   </p>
                   <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Graphic Design",
                        "Affiliate Marketing",
                        "Academic Support",
                        "Forex & Crypto Insights"
                      ].map((service, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           {service}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 space-y-10">
                   <h4 className="text-xl font-black uppercase italic">Why Choose ZiCash?</h4>
                   <div className="space-y-8">
                      {[
                        { title: "Quality you can trust", desc: "Every device is verified for performance." },
                        { title: "Customer-friendly service", desc: "We prioritize your satisfaction above all." },
                        { title: "Affordable excellence", desc: "Premium gadgets at competitive price points." },
                        { title: "One-stop destination", desc: "A growing hub for digital and everyday needs." }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-5 group">
                           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20 transition-transform group-hover:rotate-12">
                              <Star className="w-5 h-5 text-white fill-current" />
                           </div>
                           <div>
                              <p className="font-black uppercase tracking-tight text-sm mb-1">{item.title}</p>
                              <p className="text-slate-400 text-xs font-medium">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Action Section */}
          <div className="text-center space-y-10 pt-10">
             <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Ready to <span className="text-blue-600">Elevate</span>?</h2>
                <p className="text-slate-500 font-medium max-w-xl mx-auto">Join the ZiCash family and experience the future of digital shopping in Ghana.</p>
             </div>
             <div className="flex flex-wrap justify-center gap-4">
                <Link href="/categories">
                  <button className="h-16 px-10 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 gap-3 flex items-center">
                    <ShoppingBag className="w-4 h-4" /> Start Shopping
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="h-16 px-10 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all gap-3 flex items-center">
                    <MessageCircle className="w-4 h-4" /> Speak to Support
                  </button>
                </Link>
             </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
