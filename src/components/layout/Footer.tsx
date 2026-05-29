"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Twitter, Linkedin, Mail, Instagram, Zap, Video, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const displayYear = Math.max(2026, currentYear);
  const [socials, setSocials] = useState({ instagram: "", snapchat: "", tiktok: "", linkedin: "" });

  useEffect(() => {
    async function fetchSocials() {
      const { data } = await supabase.from('settings').select('*').eq('key', 'social_links').maybeSingle();
      if (data?.value) setSocials(data.value);
    }
    fetchSocials();
  }, []);

  const socialLinks = [
    { icon: Instagram, url: socials.instagram, color: "hover:text-pink-500" },
    { icon: Zap, url: socials.snapchat, color: "hover:text-yellow-500" },
    { icon: Video, url: socials.tiktok, color: "hover:text-slate-900" },
    { icon: Linkedin, url: socials.linkedin, color: "hover:text-blue-600" },
  ].filter(link => link.url);

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-32 md:pb-8 no-print">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 overflow-hidden rounded-full shadow-md border border-slate-100 bg-white">
                <Image 
                  src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                  alt="ZiCash GH Limited Logo" 
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-slate-900 font-headline leading-none">
                  Zi<span className="text-primary">Cash</span>
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-0.5">GH Limited</span>
              </div>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
              ZiCash GH Limited is your high-performance destination for premium goods and essential services. We focus on quality, reliability, and total customer satisfaction.
            </p>
            <p className="text-primary font-black italic tracking-widest text-xs uppercase">"All You Need, All For You"</p>
            
            <div className="flex items-center gap-4">
              {socialLinks.map((link, i) => (
                <Link 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  className={cn("p-2 bg-white border border-slate-200 rounded-full transition-all shadow-sm", link.color)}
                >
                  <link.icon className="w-5 h-5" />
                </Link>
              ))}
              <Link href="mailto:support@zicashgh.com" className="p-2 bg-white border border-slate-200 rounded-full hover:border-primary hover:text-primary transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Marketplace</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-semibold">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><Link href="/categories" className="hover:text-primary">Categories</Link></li>
              <li><Link href="/suggested" className="hover:text-primary">Best Deals</Link></li>
              <li><Link href="/advisor" className="hover:text-primary">AI Helper</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Legal & Support</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-semibold">
              <li><Link href="/about" className="hover:text-primary">Our Vision</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Support Center</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          <p>© {displayYear} ZiCash GH Limited. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 italic">
            <span className="text-blue-600">QUALITY PRODUCTS & SERVICES</span>
            <span>POWERED BY ZICASH DIGITAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
