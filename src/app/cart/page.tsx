"use client";

import { useCartStore } from "@/store/useCartStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, Lock, ShieldCheck, AlertCircle, ArrowRight, Tag, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const isProfileIncomplete = session && (!profile?.contact || !profile?.location);

  const handleGoToCheckout = () => {
    if (!session || !session.user) {
      toast({
        title: "Sign In Required",
        description: "Please login to buy items.",
        variant: "destructive"
      });
      router.push("/auth");
      return;
    }

    if (isProfileIncomplete) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Please add your phone and delivery address to continue."
      });
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
          <div className="p-8 bg-slate-50/50 rounded-full border border-slate-200">
            <ShoppingCart className="w-16 h-16 text-slate-300" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 uppercase italic">Your Basket is Clear</h1>
            <p className="text-slate-500 font-medium">Browse our hardware catalog to find what you need.</p>
          </div>
          <Link href="/">
            <Button size="lg" className="bg-blue-600 px-10 font-black rounded-2xl shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs h-14">
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
      <main className="flex-1 container mx-auto px-6 py-12 pb-24 md:pb-12 text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-headline uppercase italic">Your <span className="text-blue-600">Basket</span></h1>
          <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] px-4 py-2 font-black uppercase tracking-[0.2em] shadow-sm w-fit">
            {items.length} ACTIVE NODES
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {isProfileIncomplete && !isAuthLoading && (
              <Alert className="rounded-[2.5rem] border-blue-200 bg-blue-50 p-8 shadow-xl shadow-blue-500/5 mb-8">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                <AlertTitle className="font-black uppercase tracking-tight text-blue-900 text-lg">Identity Verification Required</AlertTitle>
                <AlertDescription className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
                  <span className="text-sm font-medium text-blue-700 leading-relaxed">
                    You cannot finalize this transaction until your contact number and delivery coordinates are updated.
                  </span>
                  <Link href="/profile">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl gap-2 h-11 px-6 shrink-0 shadow-lg shadow-blue-600/20">
                      Update Profile <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {items.map((item) => {
                const price = item.selectedVariant ? item.selectedVariant.price : item.price;
                const cartId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;

                return (
                  <div key={cartId} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center hover:shadow-2xl transition-all duration-500 group">
                    <div className="relative w-32 h-32 bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                      <Image 
                        src={item.image_url} 
                        alt={item.name} 
                        width={128}
                        height={128}
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                        sizes="128px"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3 text-center sm:text-left min-w-0">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 truncate uppercase leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.brand} / {item.category}</p>
                      </div>
                      
                      {item.selectedVariant && (
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                           <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Settings2 className="w-3.5 h-3.5" /></div>
                           <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                             {item.selectedVariant.label}
                           </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center border-2 border-slate-100 rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white" onClick={() => updateQuantity(cartId, item.quantity - 1)}>
                          <Minus className="w-4 h-4 text-slate-600" />
                        </Button>
                        <span className="w-10 text-center font-black text-slate-900 italic">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white" onClick={() => updateQuantity(cartId, item.quantity + 1)}>
                          <Plus className="w-4 h-4 text-slate-600" />
                        </Button>
                      </div>
                      <div className="w-32 text-right">
                        <p className="font-black text-xl text-slate-900 italic tracking-tighter">GH₵ {(price * item.quantity).toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate: GH₵ {price.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full h-11 w-11 transition-colors" onClick={() => removeItem(cartId)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/">
              <Button variant="ghost" className="mt-8 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2" /> Resume Procurement
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-10 shadow-2xl shadow-blue-600/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16" />
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest italic font-headline relative z-10">Archival Summary</h2>
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between text-[11px] text-slate-400 font-black uppercase tracking-widest">
                  <span>Unit Total</span>
                  <span className="text-slate-900">GH₵ {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-black uppercase tracking-widest">
                  <span>Logistics</span>
                  <span className="text-emerald-600">INCLUDED</span>
                </div>
                <div className="pt-8 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                  <span className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">Grand Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-blue-600 italic tracking-tighter block">GH₵ {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {!session && !isAuthLoading ? (
                <Link href="/auth" className="block">
                  <Button className="w-full h-20 bg-slate-950 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-slate-950/20 transition-all hover:scale-[1.02] gap-3">
                    <Lock className="w-6 h-6" /> Identify to Purchase
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full h-20 bg-blue-600 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none"
                  onClick={handleGoToCheckout}
                  disabled={isAuthLoading || isProfileIncomplete}
                >
                  {isProfileIncomplete ? "Verify Identity to Proceed" : "Proceed to Checkout"}
                </Button>
              )}

              <div className="pt-6 text-center space-y-4">
                 <div className="flex items-center justify-center gap-3 text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">High Entropy Secure Link</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
