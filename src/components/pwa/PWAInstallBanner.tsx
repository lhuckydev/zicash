"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallBanner({ onInstall, onDismiss }: PWAInstallBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth entry after page load
    const timer = setTimeout(() => {
      const hasDismissed = localStorage.getItem("zicash_pwa_dismissed");
      if (!hasDismissed) {
        setIsVisible(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("zicash_pwa_dismissed", Date.now().toString());
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-96 z-[60] no-print"
        >
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl shadow-blue-600/20 border border-white/10 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl shrink-0 rotate-3">
                  <Image 
                    src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                    alt="ZiCash App" 
                    width={56} 
                    height={56} 
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-lg uppercase tracking-tight italic">
                    ZiCash <span className="text-blue-500">App</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      <ShieldCheck className="w-2.5 h-2.5" /> Secure
                    </div>
                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic">Fast & Lite</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/60 font-medium leading-relaxed">
                Install our official application for a faster shopping experience, instant notifications, and better offline access.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={onInstall}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-12 gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Download className="w-4 h-4" /> Install Now
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-white/40 hover:text-white font-black uppercase text-[10px] tracking-widest h-12"
                >
                  Maybe Later
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-1 opacity-20">
                <Smartphone className="w-3 h-3" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <Sparkles className="w-3 h-3" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
