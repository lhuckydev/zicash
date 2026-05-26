"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  Printer, 
  ArrowLeft,
  Globe,
  Phone,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total_amount: any;
  status: string;
  items: any[];
  user_id: string;
  payment_type: string;
  shipping_region?: string;
  shipping_area?: string;
  shipping_community?: string;
}

interface Profile {
  full_name: string;
  contact: string;
  location: string;
}

export default function InvoicePrintPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

        if (orderData?.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", orderData.user_id)
            .maybeSingle();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Invoice Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (!order) return <div className="p-10 text-center font-black">ORDER DATA NOT FOUND.</div>;

  const shippingAddress = order.shipping_region 
    ? `${order.shipping_community}, ${order.shipping_area}, ${order.shipping_region}`
    : profile?.location;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-body print-container">
      {/* Action Bar (Hidden on Print) */}
      <div className="no-print bg-slate-50 border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Exit View
        </Button>
        <Button onClick={() => window.print()} className="bg-blue-600 font-bold uppercase text-[10px] tracking-widest gap-2 text-white">
          <Printer className="w-4 h-4" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-[800px] mx-auto p-12 md:p-20 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-10 items-start border-b-2 border-slate-100 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 bg-white">
                 <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="Logo" width={48} height={48} />
               </div>
               <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">ZICASH GHANA LTD</h1>
            </div>
            <div className="space-y-1 text-slate-500 font-medium text-xs">
              <p className="text-blue-600 font-black italic tracking-widest uppercase text-[10px]">"All You Need, All For You"</p>
              <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Accra, Ghana</p>
              <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> +233 59 720 4494</p>
              <p className="flex items-center gap-2"><Globe className="w-3 h-3" /> www.zicash.online</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <h2 className="text-5xl font-black text-slate-200 uppercase tracking-tight">RECEIPT</h2>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Order Reference</p>
              <p className="text-lg font-black text-slate-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs font-bold text-slate-500">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Billed To:</h3>
            <div className="space-y-1 font-bold text-slate-800">
               <p className="text-lg font-black">{order.customer_name}</p>
               <p className="text-sm font-medium text-slate-500">{order.customer_email}</p>
               <p className="text-sm font-medium text-slate-500">{profile?.contact || "No contact on file"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Shipping Destination:</h3>
            <div className="space-y-1 font-bold text-slate-800">
               <p className="text-sm leading-relaxed">{shippingAddress || "No delivery address provided"}</p>
               <p className="text-xs font-black uppercase text-blue-600 mt-2">Method: {order.payment_type === 'POD' ? 'Express Delivery' : 'Standard Shipping'}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-6">
          <Table className="border-t-2 border-slate-900">
            <TableHeader>
              <TableRow className="border-b-2 border-slate-900 hover:bg-transparent">
                <TableHead className="font-black text-[10px] uppercase text-slate-900 pl-0">Product</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-slate-900">Unit Price</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase text-slate-900">Qty</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-slate-900 pr-0">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, idx) => (
                <TableRow key={idx} className="border-b border-slate-100 hover:bg-transparent">
                  <TableCell className="py-6 pl-0">
                    <p className="font-black text-sm text-slate-900 leading-tight">{item.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Quality Item</p>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-500">GHS {parseFloat(item.price).toLocaleString()}</TableCell>
                  <TableCell className="text-center font-bold text-slate-900">{item.quantity}</TableCell>
                  <TableCell className="text-right font-black text-slate-900 pr-0">GHS {(parseFloat(item.price) * item.quantity).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end pt-6">
            <div className="w-full max-w-[280px] space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                 <span className="font-bold text-slate-600">GHS {parseFloat(order.total_amount).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Delivery Fee</span>
                 <span className="font-black text-emerald-600 uppercase text-[10px]">FREE</span>
               </div>
               <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end">
                 <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">Grand Total</span>
                 <span className="text-2xl font-black text-slate-900 italic tracking-tighter">GHS {parseFloat(order.total_amount).toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-20 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Transaction Status: {order.status.toUpperCase()}</p>
            <p className="text-[10px] font-medium text-slate-400 max-w-sm mx-auto leading-relaxed italic">
              Products remain property of ZICASH GHANA LTD until full payment check. 
              Warranty terms apply as per service agreement.
            </p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
             <h3 className="font-black text-lg text-slate-900 font-headline uppercase tracking-tighter italic">Thank you for your business.</h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">ZICASH GHANA LTD | 2024 PREMIUM HARDWARE</p>
          </div>
        </div>

      </div>
    </div>
  );
}
