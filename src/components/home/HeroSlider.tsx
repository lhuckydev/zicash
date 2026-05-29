"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  type CarouselApi 
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle, ArrowRight, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slide } from "@/components/admin/AdminSlideManager";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data, error } = await supabase
          .from('slideshow_slides')
          .select('*')
          .eq('is_active', true)
          .order('position', { ascending: true });
        
        if (!error && data) setSlides(data);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleSlideClick = (slide: Slide) => {
    if (!slide.link) return;

    if (slide.link_type === 'whatsapp') {
      const cleanPhone = slide.link.replace(/[^0-9]/g, '');
      const phoneWithCode = cleanPhone.startsWith('233') ? cleanPhone : `233${cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone}`;
      window.open(`https://wa.me/${phoneWithCode}`, '_blank');
    } else if (slide.link_type === 'external') {
      window.open(slide.link.startsWith('http') ? slide.link : `https://${slide.link}`, '_blank');
    }
  };

  if (isLoading) return (
    <div className="container mx-auto px-5 pt-6">
       <Skeleton className="w-full h-[240px] md:h-[400px] rounded-[2.5rem] animate-pulse" />
    </div>
  );

  if (slides.length === 0) return null;

  return (
    <section className="relative group pt-4 px-4 md:px-10 overflow-hidden">
      <Carousel 
        setApi={setApi} 
        className="w-full relative z-10" 
        opts={{ loop: true, align: 'center' }}
        plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
      >
        <CarouselContent className="-ml-4 h-[240px] md:h-[400px] items-center">
          {slides.map((slide, index) => {
            const isInternal = slide.link_type === 'internal';
            const isActive = current === index;

            const content = (
              <div className={cn(
                "relative h-[220px] md:h-[400px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden transition-all duration-1000 ease-out shadow-2xl group/item",
                isActive ? "scale-100 opacity-100 ring-2 ring-blue-500/10" : "scale-90 opacity-40 blur-[1px]"
              )}>
                <Image 
                  src={slide.image_url} 
                  alt={slide.title || "Banner"} 
                  fill 
                  className="object-cover transition-transform duration-[10000ms] group-hover/item:scale-110" 
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent z-20" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-14 z-30">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="max-w-2xl space-y-2 md:space-y-4"
                  >
                    {slide.title && (
                      <h2 className="text-2xl md:text-5xl font-black text-white font-headline tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-blue-100/80 font-bold text-[10px] md:text-lg uppercase tracking-widest drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    )}
                    
                    {slide.link && (
                      <div className="pt-1 flex gap-4">
                         <Button 
                           className={cn(
                             "h-9 md:h-14 px-6 md:px-10 rounded-xl md:rounded-3xl font-black uppercase tracking-widest text-[9px] md:text-[11px] shadow-2xl transition-all hover:scale-105 gap-2",
                             slide.link_type === 'whatsapp' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                           )}
                           onClick={(e) => {
                             if (!isInternal) {
                               e.preventDefault();
                               handleSlideClick(slide);
                             }
                           }}
                         >
                           {slide.link_type === 'whatsapp' ? (
                             <><MessageCircle className="w-3 h-3 md:w-5 h-5" /> Chat</>
                           ) : (
                             <><Zap className="w-3 h-3 md:w-5 h-5" /> Explore</>
                           )}
                         </Button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            );

            return (
              <CarouselItem key={slide.id} className="pl-4 basis-[95%] md:basis-[85%] lg:basis-[75%]">
                {isInternal ? (
                  <Link href={slide.link || "#"}>
                    {content}
                  </Link>
                ) : (
                  <div onClick={() => handleSlideClick(slide)} className="cursor-pointer">
                    {content}
                  </div>
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              current === i ? "bg-blue-600 w-8" : "bg-slate-200 w-2 hover:bg-slate-300"
            )}
          />
        ))}
      </div>
    </section>
  );
}