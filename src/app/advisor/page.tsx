"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AiLaptopAdvisor } from "@/components/advisor/AiLaptopAdvisor";
import { 
  MessageSquare, 
  Menu,
  X,
  Zap,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvisorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  // Initialize and sync usage count with local storage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedUsage = localStorage.getItem('zicash_advisor_usage');

    if (storedUsage) {
      const data = JSON.parse(storedUsage);
      if (data.date === today) setUsageCount(data.count);
      else {
        setUsageCount(0);
        localStorage.setItem('zicash_advisor_usage', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('zicash_advisor_usage', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const handleUsageUpdate = (newCount: number) => {
    setUsageCount(newCount);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('zicash_advisor_usage', JSON.stringify({ date: today, count: newCount }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
          <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" fill className="object-cover" />
        </div>
        <span className="font-bold text-slate-900 tracking-tight">Zi<span className="text-blue-600">Cash</span> AI</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Primary Core</p>
          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all font-bold text-sm bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5">
            <MessageSquare className="w-4 h-4" />
            AI Consultant
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-50 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">G</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">Guest Identity</p>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Active Link</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden relative">
        <aside className="hidden lg:block w-72 shrink-0">
          <SidebarContent />
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
              />
              <motion.aside 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-[80%] max-w-xs z-[70] shadow-2xl"
              >
                <SidebarContent />
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-6 -right-12 p-2 bg-white rounded-full shadow-xl"
                >
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 bg-[#FBFBFE]">
          <header className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest italic">
                   AI Laptop Advisor
                 </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                <Zap className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic leading-none pt-0.5">
                  Tokens: {Math.max(0, 2 - usageCount)}/2
                </span>
              </div>
            </div>
          </header>

          <div className="flex-1 relative overflow-hidden flex flex-col">
            <AiLaptopAdvisor 
              usageCount={usageCount} 
              onUsageUpdate={handleUsageUpdate} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
