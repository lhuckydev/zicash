"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  X, 
  Truck,
  Loader2,
  Receipt,
  AlertCircle,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  created_at: string;
  total_amount: any;
  status: string;
  payment_type: string;
  momo_sender_name?: string;
  payment_screenshot_url?: string;
  is_accra: boolean;
  items: any[];
}

interface Profile {
  full_name: string;
  contact: string;
  location: string;
}

export default function UserOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  async function fetchOrderDetails() {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, contact, location")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Error", description: err.message });
      router.push("/orders");
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Delivered": return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
      case "Shipped": return { icon: Truck, color: "text-purple-500", bg: "bg-purple-50" };
      case "Cancelled": return { icon: X, color: "text-red-500", bg: "bg-red-50" };
      default: return { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen tech-grid">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin opacity-20" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const status = getStatusInfo(order.status);

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-6 pb-24 md:pb-12 text-slate-900">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/orders")} 
                className="p-0 h-auto font-bold text-slate-400 hover:text-primary uppercase text-[10px] tracking-widest"
              >
                <ArrowLeft className="w-3 h-3 mr-2" /> Back to Orders
              </Button>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl md:text-5xl font-bold font-headline uppercase italic">Order <span className="text-primary">Summary</span></h1>
                <Badge className={cn("rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-widest border-none", status.bg, status.color)}>
                  {order.status}
                </Badge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">REF: #{order.id.slice(0,8).toUpperCase()}</p>
            </div>
          </div>

          <ServiceHighlights />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Products */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="text-base font-headline font-bold uppercase tracking-[0.15em] flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" /> Purchase Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          <Image src={item.image_url} alt={item.name} width={80} height={80} className="object-contain p-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-base truncate uppercase">{item.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Hash className="w-3 h-3" /> Qty: {item.quantity}
                            </span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              GH₵{parseFloat(item.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="font-bold text-slate-900 italic">GH₵{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t-2 border-dashed border-slate-100 space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-slate-900">GH₵{parseFloat(order.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-600 font-black italic">FREE</span>
                    </div>
                    <div className="pt-6 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-3xl font-black text-primary font-headline italic tracking-tighter">GH₵{parseFloat(order.total_amount).toLocaleString()}</p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-emerald-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-base font-headline font-bold uppercase tracking-[0.15em] flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        {order.payment_type === "Prepayment" ? <Smartphone className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 uppercase">
                          {order.payment_type === "Prepayment" ? "Mobile Money Prepayment" : "Payment on Delivery"}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: Verified & Secured</p>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Delivery info */}
            <div className="space-y-8">
               <Card className="rounded-[2.5rem] border-none shadow-xl bg-[#0F172A] text-white overflow-hidden">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-base font-headline font-bold uppercase tracking-[0.15em] flex items-center gap-3 text-white/50">
                      <MapPin className="w-5 h-5" /> Delivery Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">Recipient</p>
                      <p className="text-xl font-bold font-headline uppercase">{profile?.full_name || 'Shopping Guest'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">Contact</p>
                      <p className="font-bold">{profile?.contact || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">Destination</p>
                      <p className="text-sm font-medium leading-relaxed opacity-80">{profile?.location || 'Address on file'}</p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                       <div className="flex items-center gap-3 text-emerald-400">
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Active: {order.is_accra ? "Accra Metropolis" : "Regional Shipping"}</span>
                       </div>
                    </div>
                  </CardContent>
               </Card>

               <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                  <CardContent className="p-8 text-center space-y-4">
                    <Receipt className="w-10 h-10 text-slate-200 mx-auto" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                      Thank you for choosing ZiCash. Your hardware is in good hands.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] border-slate-200"
                      onClick={() => window.print()}
                    >
                      Print Summary
                    </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}