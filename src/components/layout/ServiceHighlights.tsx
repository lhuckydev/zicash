"use client";

import { ShieldCheck, Truck, RefreshCcw, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: ShieldCheck, title: "Secure Payments", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Truck, title: "Fast Delivery", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: RefreshCcw, title: "Easy Returns", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Headphones, title: "24/7 Support", color: "text-indigo-600", bg: "bg-indigo-50" },
];

export function ServiceHighlights() {
  return (
    <div className="w-full overflow-x-auto lg:overflow-visible scrollbar-hide py-4 px-1 lg:px-0">
      <div className="flex lg:grid lg:grid-cols-4 gap-4 min-w-max lg:min-w-full">
        {highlights.map((item, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 bg-white p-3 pr-5 lg:pr-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 flex-1"
          >
            <div className={cn("p-2 lg:p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", item.bg, item.color)}>
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
                {item.title}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Verified Store Service</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}