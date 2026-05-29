"use client";

import { useCartStore } from "@/store/useCartStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, Lock, ShieldCheck, AlertCircle, ArrowRight, Settings2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCartStore();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentSession.user.id)
            .maybeSingle();
          setProfile(data);
        }
      } catch (err) {
        console.error("Cart error", err);
      } finally {
        setIsAuthLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const totalSavings = useMemo(() => {
    return items.reduce((acc, item) => {
      const v = item.selectedVariant;
      const original = v ? v.price : item.price;
      const discountPrice = v?.discount?.discount_price;
      if (discountPrice && discountPrice > 0) {
        return acc + ((original - discountPrice) * item.quantity);
      }
      return acc;
    }, 0);
  }, [items]);

  const isProfileIncomplete = session && (!profile?.contact || !profile?.location);

  const handleGoToCheckout = () => {
    if (!session || !session.user) {
      toast({ title: "Sign In Required", variant: "destructive" });
      router.push("/auth");
      return;
    }
    if (isProfileIncomplete) {
      toast({ variant: "destructive", title: "Profile Incomplete" });
      router.push("/profile");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen tech-grid">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 pb-24 md:pb-12 text-slate-900">
          <div className="p-8 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
            <ShoppingCart className="w-12 h-12 text-slate-200" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900 uppercase italic">Basket Is Clear</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Find your next hardware upgrade.</p>
          </div>
          <Link href="/">
            <Button size="lg" className="bg-blue-600 px-10 font-black rounded-2xl shadow-xl shadow-blue-600/20 uppercase tracking-widest text-[10px] h-12">
              Return to Catalog
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-6 pb-24 md:pb-12 text-slate-900">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-black text-slate-900 font-headline uppercase italic">Your <span className="text-blue-600">Basket</span></h1>
          <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] px-3 py-1 font-black uppercase tracking-widest shadow-sm">
            {items.length} ACTIVE ITEMS
          </Badge>
        </div>

        <ServiceHighlights />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-6">
          <div className="lg:col-span-2 space-y-6">
            {isProfileIncomplete && !isAuthLoading && (
              <Alert className="rounded-[2.5rem] border-blue-200 bg-blue-50 p-6 shadow-xl shadow-blue-500/5 mb-6">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertTitle className="font-black uppercase tracking-tight text-blue-900">Identity Required</AlertTitle>
                <AlertDescription className="mt-3">
                  <span className="text-xs font-bold text-blue-700/70 block mb-4 uppercase tracking-widest">Update phone and address to proceed.</span>
                  <Link href="/profile">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl gap-2 h-10 shadow-lg">
                      Update Profile <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {items.map((item) => {
                const originalPrice = item.selectedVariant ? item.selectedVariant.price : item.price;
                const discountPrice = item.selectedVariant?.discount?.discount_price;
                const finalPrice = (discountPrice && discountPrice > 0) ? discountPrice : originalPrice;
                const hasDiscount = !!(discountPrice && discountPrice > 0);
                const cartId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;

                return (
                  <div key={cartId} className="bg-white rounded-[2rem] border border-slate-100 p-5 flex items-center gap-4 hover:shadow-xl transition-all group">
                    <div className="relative w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-2" sizes="80px" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-900 truncate uppercase leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{item.brand}</p>
                        {item.selectedVariant && (
                          <Badge className="bg-blue-50 text-blue-600 border-none text-[7px] font-black uppercase px-2">{item.selectedVariant.label}</Badge>
                        )}
                      </div>
                      <p className={cn("font-black text-sm italic tracking-tighter mt-1", hasDiscount ? "text-red-600" : "text-blue-600")}>
                        GH₵ {(finalPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50 shadow-inner overflow-hidden">
                        <button className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-blue-600" onClick={() => updateQuantity(cartId, item.quantity - 1)}><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center font-black text-xs text-slate-900">{item.quantity}</span>
                        <button className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-blue-600" onClick={() => updateQuantity(cartId, item.quantity + 1)}><Plus className="w-3 h-3" /></button>
                      </div>
                      <button className="text-red-300 hover:text-red-500" onClick={() => removeItem(cartId)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-2xl shadow-blue-600/5 sticky top-24">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest italic font-headline">Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <span>Unit Total</span>
                  <span className="text-slate-900">GH₵ {(total + totalSavings).toLocaleString()}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[10px] text-red-600 font-black uppercase tracking-widest">
                    <span>Total Savings</span>
                    <span>- GH₵ {totalSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-end">
                  <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2">Grand Total</span>
                  <span className="text-3xl font-black text-blue-600 italic tracking-tighter">GH₵ {total.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                className="w-full h-16 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                onClick={handleGoToCheckout}
                disabled={isAuthLoading || isProfileIncomplete}
              >
                Checkout Securely
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
