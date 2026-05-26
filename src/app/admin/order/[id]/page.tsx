
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { sendSms } from "@/lib/sms";
import { 
  User, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Phone, 
  Loader2, 
  ExternalLink, 
  LayoutDashboard, 
  Package, 
  ChevronDown, 
  Users, 
  Eye, 
  ImageIcon, 
  Trash2,
  MessageSquareQuote,
  MapPin,
  Target,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total_amount: any;
  status: string;
  payment_type: "POD" | "Prepayment";
  momo_sender_name?: string;
  payment_screenshot_url?: string;
  is_accra: boolean;
  items: any[];
  user_id: string;
  extra_notes?: string;
  shipping_region?: string;
  shipping_area?: string;
  shipping_community?: string;
}

interface Profile {
  id: string;
  full_name: string;
  contact: string;
  location: string;
  avatar_url?: string;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setIsLoading(true);
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
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
      } else {
        toast({ title: "Status Updated", description: `Order is now ${status}.` });
        setOrder(prev => prev ? { ...prev, status } : null);
        
        // Notify Customer of Status Update
        if (profile?.contact) {
          const customerName = profile?.full_name || "Customer";
          const mainItem = order.items[0]?.name || "Hardware";
          const amountFormatted = `GHS ${Number(order.total_amount).toLocaleString()}`;
          
          await sendSms(
            profile.contact, 
            `Hi ${customerName}, your ZiCash order for ${mainItem} (${amountFormatted}) is now ${status.toUpperCase()}. Thank you!`
          );
        }
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Permanently delete this order record?")) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Order Removed", description: "Order has been deleted from the database." });
      router.push("/admin");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: err.message });
      setIsDeleting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-20" />
    </div>
  );

  if (!order) return null;

  // Prefer order-specific shipping address over profile address
  const shippingAddress = order.shipping_region 
    ? `${order.shipping_community}, ${order.shipping_area}, ${order.shipping_region}`
    : profile?.location;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body">
      <aside className="hidden lg:flex w-64 bg-slate-950 flex-col shrink-0 text-white shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white">
            <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash Admin" fill className="object-cover" />
          </div>
          <span className="font-bold text-lg tracking-tight">Zi<span className="text-blue-500">Cash GH</span> Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          <nav className="space-y-1">
             <Link href="/admin" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm font-medium">
               <LayoutDashboard className="w-4 h-4" /> Dashboard
             </Link>
             <div className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between shadow-lg shadow-blue-600/10">
                <div className="flex items-center gap-3"><Package className="w-4 h-4" /> Order Details</div>
             </div>
             <Link href="/admin" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm font-medium">
               <Users className="w-4 h-4" /> Customers
             </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
           <Button variant="ghost" onClick={() => router.push('/admin')} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-blue-600">
               <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:opacity-80">
              <Eye className="w-4 h-4" /> Visit Store
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ORDER REFERENCE: #{order.id.slice(0, 8).toUpperCase()}</div>
              <h1 className="text-3xl font-black text-slate-900 font-headline">Order <span className="text-blue-600 italic">Information</span></h1>
            </div>

            <div className="flex items-center gap-3">
               <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest h-11 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteOrder} disabled={isDeleting}>
                 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete Order
               </Button>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-11 text-[10px] font-black uppercase tracking-widest rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 gap-3">
                      Status: {order.status} <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 shadow-2xl">
                    <DropdownMenuItem onClick={() => handleUpdateStatus("Processing")}>Move to Processing</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus("Shipped")}>Mark as Shipped</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus("Delivered")} className="text-emerald-600">Confirm Delivery</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus("Cancelled")} className="text-red-600">Cancel Order</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><User className="w-5 h-5" /></div>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white shadow-xl">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{order.customer_name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 truncate">{order.customer_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{order.customer_email}</p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2"><Phone className="w-3 h-3 text-blue-500" /><span className="text-xs font-bold text-slate-600">{profile?.contact || "No contact found"}</span></div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><ShoppingBag className="w-5 h-5" /></div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-300 uppercase">Order Value</p>
                 <p className="font-black text-slate-900 text-lg italic tracking-tighter">GHS {parseFloat(order.total_amount).toLocaleString()}</p>
                 <p className="text-xs text-slate-400 font-medium">{order.is_accra ? "Express Delivery" : "Standard Region Delivery"}</p>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><CreditCard className="w-5 h-5" /></div>
              <div className="space-y-1">
                 <p className="text-xs font-bold text-slate-900">{order.payment_type === 'POD' ? "POD (Cash/MoMo)" : "MoMo Prepayment"}</p>
                 <p className="text-[10px] text-slate-400">{order.payment_type === 'Prepayment' ? `Sender: ${order.momo_sender_name}` : "Pending Payment Check."}</p>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-6 space-y-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl -mr-12 -mt-12" />
               <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 relative z-10"><MapPin className="w-5 h-5" /></div>
               <div className="space-y-1 relative z-10">
                 <p className="text-[9px] font-black uppercase text-white/40">Delivery Destination</p>
                 <p className="text-xs font-bold leading-relaxed line-clamp-2">{shippingAddress || 'No address found'}</p>
               </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Extra Notes Highlight */}
              <Card className={cn(
                "border-none shadow-xl rounded-[2.5rem] p-8 space-y-4 transition-all",
                order.extra_notes ? "bg-blue-600 text-white" : "bg-white text-slate-400"
              )}>
                <div className="flex items-center gap-3">
                   <MessageSquareQuote className={cn("w-6 h-6", order.extra_notes ? "text-blue-200" : "text-slate-200")} />
                   <h3 className="font-black uppercase tracking-widest text-sm">Customer Preferences / Notes</h3>
                </div>
                <div className={cn(
                  "p-6 rounded-2xl font-bold leading-relaxed shadow-inner",
                  order.extra_notes ? "bg-white/10 border border-white/10 text-white" : "bg-slate-50 text-slate-300 italic"
                )}>
                  {order.extra_notes || "No extra preferences specified by customer."}
                </div>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Order <span className="text-blue-600 italic">Items</span></CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-50">
                        <TableHead className="pl-8 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Item Description</TableHead>
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Price</TableHead>
                        <TableHead className="pr-8 text-right font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, idx) => (
                        <TableRow key={idx} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                          <TableCell className="pl-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden border border-slate-100 shadow-sm">
                                <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
                              </div>
                              <p className="text-xs font-black text-slate-900">{item.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-500">GHS {parseFloat(item.price).toLocaleString()}</TableCell>
                          <TableCell className="pr-8 text-right text-xs font-black text-slate-900">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
                     <span className="text-[10px] font-black uppercase text-slate-400">Total Valuation</span>
                     <span className="text-2xl font-black text-blue-600 italic">GHS {parseFloat(order.total_amount).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] bg-[#0F172A] text-white p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 opacity-60"><Truck className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Delivery Details</span></div>
                   {order.shipping_region && <Badge className="bg-blue-600 border-none font-black text-[8px] uppercase">{order.shipping_region}</Badge>}
                </div>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase opacity-40">Delivery Destination</p>
                      <p className="text-sm font-bold leading-relaxed">{shippingAddress}</p>
                   </div>
                   <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-40">Recipient</p><p className="text-sm font-bold">{order.customer_name}</p></div>
                </div>
              </Card>
            </div>

            <div className="space-y-8">
              {order.payment_screenshot_url && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                  <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-600/30"><ImageIcon className="w-4 h-4 text-blue-400" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">MoMo Receipt</span>
                    </div>
                    <Link href={order.payment_screenshot_url} target="_blank"><Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white"><ExternalLink className="w-4 h-4" /></Button></Link>
                  </div>
                  <CardContent className="p-6">
                    <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-inner border border-slate-100 bg-slate-50">
                       <Image src={order.payment_screenshot_url} alt="Payment Proof" fill className="object-cover transition-transform hover:scale-105 duration-700 cursor-zoom-in" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
