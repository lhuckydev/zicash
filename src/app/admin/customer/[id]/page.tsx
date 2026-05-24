"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  ArrowLeft, 
  Loader2, 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp, 
  ChevronRight,
  ExternalLink,
  Search,
  Eye,
  Calendar,
  CreditCard,
  Target,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  contact: string;
  location: string;
  avatar_url?: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  created_at: string;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: any;
  status: string;
  items: any[];
}

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch Orders
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false });

        if (orderError) throw orderError;
        setOrders(orderData || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomerData();
  }, [id]);

  const totalSpend = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-20" />
    </div>
  );

  if (!profile) return <div className="p-10 text-center font-black">CUSTOMER DATA NOT FOUND.</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body">
      {/* Sidebar (Desktop) */}
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
             <Link href="/admin" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm font-medium">
                <Package className="w-4 h-4" /> Store
             </Link>
             <div className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between shadow-lg shadow-blue-600/10">
                <div className="flex items-center gap-3"><Users className="w-4 h-4" /> Customer Profile</div>
             </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" onClick={() => router.push('/admin')} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-blue-600">
               <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:opacity-80">
              <Eye className="w-4 h-4" /> Visit Store
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
               <Avatar className="w-24 h-24 border-4 border-white shadow-2xl rounded-3xl">
                 <AvatarImage src={profile.avatar_url} className="object-cover" />
                 <AvatarFallback className="bg-blue-50 text-blue-600 text-3xl font-black">{profile.full_name?.[0]}</AvatarFallback>
               </Avatar>
               <div className="space-y-1">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">CUSTOMER INSIGHTS</div>
                 <h1 className="text-4xl font-black text-slate-900 font-headline uppercase">{profile.full_name || 'Anonymous User'}</h1>
                 <p className="text-sm font-medium text-slate-500 italic">Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
               </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 flex items-center justify-between group hover:shadow-xl transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Spend</p>
                <h3 className="text-3xl font-black text-blue-600 mt-2 italic tracking-tighter">GH₵ {totalSpend.toLocaleString()}</h3>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600"><DollarSign className="w-6 h-6" /></div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 flex items-center justify-between group hover:shadow-xl transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2 italic tracking-tighter">{orders.length} Units</h3>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600"><ShoppingBag className="w-6 h-6" /></div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-emerald-600 p-8 flex items-center justify-between group hover:shadow-xl transition-all text-white">
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Account Status</p>
                <h3 className="text-3xl font-black mt-2 italic tracking-tighter uppercase">Verified</h3>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 text-white"><CheckCircle2 className="w-6 h-6" /></div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Contact Stack */}
             <div className="space-y-6">
               <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Communication Node</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-5 h-5" /></div>
                       <div><p className="text-[9px] font-black uppercase text-slate-300">Email Address</p><p className="text-sm font-bold text-slate-900">{profile.email}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-5 h-5" /></div>
                       <div><p className="text-[9px] font-black uppercase text-slate-300">Phone Network</p><p className="text-sm font-bold text-slate-900">{profile.contact || 'Not Provided'}</p></div>
                    </div>
                  </div>
               </Card>

               <Card className="border-none shadow-sm rounded-[2rem] bg-[#0F172A] text-white p-8 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-center justify-between relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Logistics Target</h4>
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-[9px] font-black uppercase opacity-30">Default Location</p>
                      <p className="text-sm font-medium leading-relaxed mt-1">{profile.location || 'No address synced'}</p>
                    </div>
                    {profile.google_maps_link && (
                      <Link href={profile.google_maps_link} target="_blank">
                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 font-black rounded-xl text-[9px] uppercase tracking-widest h-10 gap-2">
                           <Target className="w-3 h-3" /> View Coordinate Node
                        </Button>
                      </Link>
                    )}
                  </div>
               </Card>
             </div>

             {/* Order History Stack */}
             <div className="lg:col-span-2">
               <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden h-full">
                  <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Order <span className="text-blue-600 italic">Timeline</span></CardTitle>
                    <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[10px]">{orders.length} Transmissions</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-50 hover:bg-transparent">
                          <TableHead className="pl-8 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Order ID</TableHead>
                          <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Timestamp</TableHead>
                          <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Amount</TableHead>
                          <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                          <TableHead className="pr-8 text-right font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow key={o.id} className="group cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => router.push(`/admin/order/${o.id}`)}>
                            <TableCell className="pl-8 font-black text-xs text-blue-600 uppercase">#{o.id.slice(0, 8)}</TableCell>
                            <TableCell className="text-xs font-bold text-slate-500">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs font-black italic tracking-tighter">GH₵ {parseFloat(o.total_amount).toLocaleString()}</TableCell>
                            <TableCell>
                               <Badge className={cn(
                                 "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border-none",
                                 o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                               )}>{o.status}</Badge>
                            </TableCell>
                            <TableCell className="pr-8 text-right"><ArrowRight className="w-4 h-4 ml-auto text-slate-200 group-hover:text-blue-600 transition-all" /></TableCell>
                          </TableRow>
                        ))}
                        {orders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
                               No historical transactions detected.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
               </Card>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
