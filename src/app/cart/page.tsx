"use client";

import { useCartStore } from "@/store/useCartStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, Lock, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
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
        console.error("Cart: Auth initialization error", err);
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
        title: "Please Login",
        description: "You need to sign in to buy items.",
        variant: "destructive"
      });
      router.push("/auth");
      return;
    }

    if (isProfileIncomplete) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Please add your phone number and delivery address to continue."
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
            <h1 className="text-3xl font-bold text-slate-900">Your cart is empty</h1>
            <p className="text-slate-500 font-medium">Browse our products to find something you like.</p>
          </div>
          <Link href="/">
            <Button size="lg" className="bg-primary px-8 font-bold rounded-xl shadow-lg shadow-primary/20">
              Explore Products
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
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-4xl font-bold text-slate-900 font-headline">Your <span className="text-primary italic">Cart</span></h1>
          <Badge className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold uppercase tracking-widest">
            {items.length} ITEMS
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {isProfileIncomplete && !isAuthLoading && (
              <Alert className="rounded-[2rem] border-amber-200 bg-amber-50 p-8 shadow-xl shadow-amber-500/5">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="font-black uppercase tracking-tight text-amber-900 text-lg">Delivery Details Required</AlertTitle>
                <AlertDescription className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
                  <span className="text-sm font-medium text-amber-700 leading-relaxed">
                    You cannot place an order until your phone number and delivery location are synced.
                  </span>
                  <Link href="/profile">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl gap-2 h-11 px-6 shrink-0 shadow-lg shadow-amber-600/20">
                      Sync Profile Now <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {items.map((item) => (
              <div key={item.id} className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center hover:shadow-xl transition-all duration-300">
                <div className="relative w-32 h-32 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0">
                  <Image 
                    src={item.image_url} 
                    alt={item.name} 
                    width={128}
                    height={128}
                    className="object-contain p-2" 
                    sizes="128px"
                  />
                </div>
                
                <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-4 h-4 text-slate-600" />
                    </Button>
                    <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>
                  <div className="w-32 text-right">
                    <p className="font-bold text-lg text-slate-900">GH₵{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full h-10 w-10" onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}

            <Link href="/">
              <Button variant="ghost" className="mt-4 text-slate-500 hover:text-slate-900 font-bold uppercase text-xs tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shopping
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-slate-200 space-y-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest font-headline">Order Summary</h2>
              <div className="space-y-5">
                <div className="flex justify-between text-sm text-slate-500 font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">GH₵{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-bold uppercase tracking-widest">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                  <span className="font-bold text-sm text-slate-900 uppercase tracking-widest">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary block">GH₵{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {!session && !isAuthLoading ? (
                <Link href="/auth" className="block">
                  <Button className="w-full h-16 bg-slate-900 text-lg font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] gap-2">
                    <Lock className="w-5 h-5" /> Sign in to Buy
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full h-16 bg-primary text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                  onClick={handleGoToCheckout}
                  disabled={isAuthLoading || isProfileIncomplete}
                >
                  {isProfileIncomplete ? "Complete Profile to Checkout" : "Proceed to Checkout"}
                </Button>
              )}
              
              <div className="space-y-4 pt-4">
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Secure Ordering
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
