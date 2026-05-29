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
    <div className="w-full overflow-x-auto scrollbar-hide py-4 px-5">
      <div className="flex gap-4 min-w-max">
        {highlights.map((item, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 bg-white p-3 pr-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={cn("p-2 rounded-xl shrink-0", item.bg, item.color)}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
