"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  X, 
  RefreshCcw,
  Loader2,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  created_at: string;
  total_amount: any;
  status: string;
  items: any[];
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Shipped": return <Truck className="w-4 h-4 text-purple-500" />;
      case "Cancelled": return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 pb-24 md:pb-12 text-slate-900">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline">My <span className="text-primary italic">Orders</span></h1>
            <p className="text-slate-500 font-medium text-sm">Track your hardware purchases and delivery status</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-primary animate-spin opacity-20" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 bg-white/60 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200">
              <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h2 className="text-xl font-bold text-slate-900">No orders yet</h2>
              <p className="text-slate-400 mt-2 mb-8 max-w-xs mx-auto text-sm">Start browsing our catalog to find your next favorite hardware.</p>
              <Link href="/">
                <Button className="bg-primary px-8 font-bold rounded-xl h-12">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const mainItem = order.items?.[0];
                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="group bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden p-2">
                        {mainItem?.image_url ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={mainItem.image_url} 
                              alt={mainItem.name || "Order Item"} 
                              fill 
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <Package className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                        <h3 className="text-lg font-bold text-slate-900 font-headline leading-none">
                          {order.items.length} {order.items.length === 1 ? 'Product' : 'Products'}
                        </h3>
                        <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-8">
                         <div className="text-center md:text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                           <div className="flex items-center gap-2 justify-center md:justify-end">
                             {getStatusIcon(order.status)}
                             <span className={cn(
                               "font-bold text-xs uppercase tracking-tight",
                               order.status === "Delivered" ? "text-emerald-600" :
                               order.status === "Cancelled" ? "text-red-600" :
                               "text-slate-900"
                             )}>{order.status}</span>
                           </div>
                         </div>

                         <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                           <p className="text-xl font-black text-primary font-headline italic">GH₵{parseFloat(order.total_amount).toLocaleString()}</p>
                         </div>

                         <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all hidden md:block" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="pt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">
              Continue Shopping <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
