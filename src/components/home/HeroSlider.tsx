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
import { motion } from "framer-motion";
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
    <div className="container mx-auto px-5 pt-4">
       <Skeleton className="w-full h-[140px] md:h-[400px] rounded-[2rem] animate-pulse" />
    </div>
  );

  if (slides.length === 0) return null;

  return (
    <section className="relative group pt-4 px-1 overflow-hidden">
      <div className="container mx-auto">
        <Carousel 
          setApi={setApi} 
          className="w-full relative z-10" 
          opts={{ loop: true, align: 'center' }}
          plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
        >
          <CarouselContent className="-ml-4 h-[180px] md:h-[450px] items-center">
            {slides.map((slide, index) => {
              const isInternal = slide.link_type === 'internal';
              const isActive = current === index;

              const content = (
                <div className={cn(
                  "relative h-[160px] md:h-[400px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden transition-all duration-1000 ease-out shadow-2xl group/item",
                  isActive ? "scale-100 opacity-100 ring-2 ring-blue-500/5" : "scale-90 md:scale-95 opacity-40 blur-[1px]"
                )}>
                  <Image 
                    src={slide.image_url} 
                    alt={slide.title || "Banner"} 
                    fill 
                    className="object-cover transition-transform duration-[10000ms] group-hover/item:scale-110" 
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent z-20" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-14 z-30">
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={isActive ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="max-w-2xl space-y-1 md:space-y-4"
                    >
                      {slide.title && (
                        <h2 className="text-sm md:text-5xl font-black text-white font-headline tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                          {slide.title}
                        </h2>
                      )}
                      {slide.subtitle && (
                        <p className="text-blue-100/80 font-bold text-[7px] md:text-lg uppercase tracking-widest drop-shadow-md">
                          {slide.subtitle}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </div>
              );

              return (
                <CarouselItem key={slide.id} className="pl-4 basis-[95%] md:basis-[80%] lg:basis-[70%]">
                  {isInternal ? (
                    <Link href={slide.link || "#"} className="block">
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

        <div className="flex justify-center gap-1.5 mt-4 md:mt-6">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-1 transition-all duration-500 rounded-full",
                current === i ? "bg-blue-600 w-8" : "bg-slate-200 w-2 hover:bg-slate-300"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
