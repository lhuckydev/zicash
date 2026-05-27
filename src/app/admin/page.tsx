"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  DollarSign,
  Box,
  Clock,
  Search,
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Menu,
  RefreshCcw,
  Eye,
  LogOut,
  CheckCircle2,
  Settings2,
  X,
  Zap,
  Image as ImageIcon,
  Smartphone,
  User as UserIcon,
  MapPin,
  Save,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductVariant } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminSlideManager } from "@/components/admin/AdminSlideManager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AdminTab = "Overview" | "Orders" | "Products" | "Special Offers" | "Slideshow" | "Customers" | "Settings";

const ADMIN_EMAILS = ['zicashonline@gmail.com', 'ericboatenglucky@gmail.com'];
const SESSION_TIMEOUT = 7200000; 

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total_amount: any;
  status: string;
  payment_type: "POD" | "Prepayment";
  items: any[];
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url?: string;
  location?: string;
  contact?: string;
}

interface DiscountRowProps {
  product: Product;
  onSaveVariant: (variantId: string, price: number | null, date: string) => Promise<void>;
  isSaving: string | null;
}

const DiscountRow = ({ product, onSaveVariant, isSaving }: DiscountRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow className="border-slate-50 group hover:bg-slate-50/30 transition-colors">
        <TableCell className="pl-8 py-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl relative border border-slate-100 shrink-0 shadow-sm">
              <Image src={product.image_url} alt={product.name} fill className="object-contain p-2" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-black text-slate-900 leading-tight uppercase truncate max-w-[300px] italic">{product.name}</span>
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">{product.brand || 'Premium Brand'}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Regular Price</span>
              <span className="text-sm font-black text-slate-500 italic">GH₵ {product.price.toLocaleString()}</span>
           </div>
        </TableCell>
        <TableCell>
          <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
            {product.variants?.length || 0} Options
          </Badge>
        </TableCell>
        <TableCell className="pr-8 text-right">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "h-11 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all",
              expanded ? "bg-slate-950 text-white border-slate-950" : "bg-white text-blue-600 border-blue-100 hover:bg-blue-50"
            )}
          >
            {expanded ? "Close Module" : "Manage Offers"} {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </TableCell>
      </TableRow>
      
      {expanded && product.variants?.map((v) => (
        <VariantDiscountSubRow 
          key={v.id} 
          variant={v} 
          onSave={onSaveVariant} 
          isSaving={isSaving === v.id} 
        />
      ))}
    </>
  );
};

const VariantDiscountSubRow = ({ variant, onSave, isSaving }: { 
  variant: ProductVariant, 
  onSave: (vId: string, p: number | null, d: string) => Promise<void>,
  isSaving: boolean 
}) => {
  const [dPriceInput, setDPriceInput] = useState<string>(variant.discount?.discount_price?.toString() ?? "");
  const [dDate, setDDate] = useState(variant.discount?.ends_at ? variant.discount.ends_at.split('T')[0] : "");

  const handleSave = () => {
    const parsedPrice = parseFloat(dPriceInput);
    if (dPriceInput === "" || isNaN(parsedPrice)) {
      onSave(variant.id, null, "");
    } else {
      onSave(variant.id, parsedPrice, dDate);
    }
  };

  return (
    <TableRow className="bg-slate-50/30 border-l-4 border-l-blue-600">
      <TableCell className="pl-12 py-6" colSpan={4}>
        <div className="max-w-4xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mx-auto">
          
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Settings2 className="w-5 h-5" /></div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight truncate">{variant.label}</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Regular Rate: <span className="text-slate-600 font-black">GH₵ {(variant.price ?? 0).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 max-w-[180px]">
             <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">New Sale Price</label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 pointer-events-none z-10">GHS</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  className="pl-11 w-full h-11 rounded-xl bg-slate-50 border-transparent text-sm font-black italic px-4 focus:outline-none border-2 focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
                  value={dPriceInput} 
                  onChange={(e) => setDPriceInput(e.target.value)} 
                  placeholder="0.00"
                />
             </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 max-w-[180px]">
             <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Offer Expiry</label>
             <input 
               type="date" 
               className="h-11 w-full rounded-xl bg-slate-50 border-transparent text-[10px] font-black uppercase tracking-tight px-4 focus:outline-none border-2 focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
               value={dDate} 
               onChange={(e) => setDDate(e.target.value)} 
             />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button 
              size="sm"
              onClick={handleSave} 
              disabled={isSaving}
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Activate
            </Button>
            {variant.discount && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSave(variant.id, null, "")}
                className="h-11 w-11 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("Overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [discountSearch, setDiscountSearch] = useState("");
  const [savingDiscountId, setSavingDiscountId] = useState<string | null>(null);

  // Settings State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [momoDetails, setMomoDetails] = useState({ name: "", number: "" });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: pData, error: pError } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))')
        .order('created_at', { ascending: false });
      
      if (pError) {
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*, variants:product_variants(*)')
          .order('created_at', { ascending: false });
        if (fallbackData) setProducts(fallbackData);
      } else if (pData) {
        setProducts(pData);
      }

      const [oRes, cRes, sRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('key', 'momo_payment_details').maybeSingle()
      ]);
      
      if (oRes.data) setOrders(oRes.data);
      if (cRes.data) setCustomers(cRes.data);
      if (sRes.data && sRes.data.value) setMomoDetails(sRes.data.value);
      
    } catch (err: any) {
      console.error("Management Hub sync error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function checkExistingSession() {
      const isAuth = localStorage.getItem('admin_session') === 'true';
      const lastActivity = parseInt(localStorage.getItem('admin_last_activity') || '0');
      const now = Date.now();
      
      if (isAuth && (now - lastActivity < SESSION_TIMEOUT)) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
          setIsAuthenticated(true);
          localStorage.setItem('admin_last_activity', now.toString());
        }
      }
    }
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated, fetchAllData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      toast({ variant: "destructive", title: "Access Denied", description: "Manager clearance required." });
      return;
    }
    if (password === "zicashadmin") {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setIsAuthenticated(true);
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Incorrect passkey." });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'momo_payment_details',
          value: momoDetails,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      toast({ title: "Settings Updated", description: "Store payment credentials are now active." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveVariantDiscount = async (variantId: string, dPrice: number | null, dDate: string) => {
    setSavingDiscountId(variantId);
    try {
      if (dPrice === null || dPrice === 0 || !dDate) {
        const { error } = await supabase.from('discounts').delete().eq('variant_id', variantId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('discounts').upsert({
          variant_id: variantId,
          discount_price: dPrice,
          ends_at: new Date(dDate).toISOString(),
        }, { onConflict: 'variant_id' });
        if (error) throw error;
      }
      toast({ title: "Offer Updated", description: "Changes saved to the database." });
      fetchAllData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Restricted", description: err.message });
    } finally {
      setSavingDiscountId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Permanently remove this item?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Item Removed", description: "Catalog updated successfully." });
      fetchAllData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Restricted", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_last_activity');
    setIsAuthenticated(false);
    await supabase.auth.signOut();
    router.push('/');
  };

  const totalRevenue = useMemo(() => 
    orders.filter(o => o.status === "Delivered")
      .reduce((acc, o) => acc + (parseFloat(o.total_amount?.toString() || "0") || 0), 0), 
  [orders]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.full_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  const AdminSidebarContent = () => (
    <>
      <div className="p-8 border-b border-white/5 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-white">
          <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" fill className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-white">ZiCash GH</span>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Management Hub</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <nav className="space-y-2">
           <button onClick={() => setActiveTab("Overview")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Overview" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}>
             <LayoutDashboard className="w-4 h-4" /> Overview
           </button>
           <div className="space-y-1">
             <div className="px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-widest">Store Node</div>
             <button onClick={() => setActiveTab("Orders")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Orders" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}><ShoppingCart className="w-4 h-4" /> Orders</button>
             <button onClick={() => setActiveTab("Products")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Products" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}><Package className="w-4 h-4" /> Products</button>
             <button onClick={() => setActiveTab("Special Offers")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Special Offers" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}><Zap className="w-4 h-4" /> Special Offers</button>
             <button onClick={() => setActiveTab("Slideshow")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Slideshow" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}><ImageIcon className="w-4 h-4" /> Banners</button>
           </div>
           <div className="space-y-1">
             <div className="px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-widest">Relationships</div>
             <button onClick={() => setActiveTab("Customers")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Customers" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}><Users className="w-4 h-4" /> Customers</button>
             <button onClick={() => setActiveTab("Settings")} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest", activeTab === "Settings" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}><Settings className="w-4 h-4" /> Settings</button>
           </div>
        </nav>
      </div>
      <div className="p-6 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10"><LogOut className="w-4 h-4" /> Logout</button>
      </div>
    </>
  );

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-900">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-slate-950 p-12 text-center relative overflow-hidden">
             <h1 className="text-white font-black text-2xl uppercase italic">ZiCash <span className="text-blue-500">Manager</span></h1>
          </div>
          <CardContent className="p-12 space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <Input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-black text-center text-lg" />
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl text-white uppercase tracking-widest">Authorize</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body">
      <aside className="hidden lg:flex w-72 bg-slate-950 flex-col shrink-0 text-white shadow-2xl"><AdminSidebarContent /></aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6 flex-1">
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
               <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="w-5 h-5" /></Button></SheetTrigger>
               <SheetContent side="left" className="p-0 bg-slate-950 border-none w-[300px] flex flex-col"><AdminSidebarContent /></SheetContent>
             </Sheet>
             <div className="relative w-full max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search records..." className="bg-slate-50 border-none rounded-xl h-11 pl-12 text-xs font-bold" /></div>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={fetchAllData} disabled={isLoading}><RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} /></Button>
            <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Eye className="w-4 h-4" /> Storefront</Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <div className="flex items-center justify-between">
             <h1 className="text-4xl font-black text-slate-900 font-headline uppercase italic">{activeTab}</h1>
             {activeTab === "Products" && <Link href="/admin/products/new"><Button className="bg-blue-600 rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg"><Plus className="w-4 h-4" /> New Hardware</Button></Link>}
          </div>

          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                { label: "Sales Revenue", value: `GH₵ ${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: "bg-blue-50", color: "text-blue-600" },
                { label: "Catalog Items", value: products.length, icon: Box, bg: "bg-indigo-50", color: "text-indigo-600" },
                { label: "Pending Orders", value: orders.filter(o => o.status === "Pending").length, icon: Clock, bg: "bg-orange-50", color: "text-orange-600" },
                { label: "Verified Users", value: customers.length, icon: Users, bg: "bg-emerald-50", color: "text-emerald-600" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl p-8 flex items-center justify-between bg-white">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p><h3 className="text-3xl font-black text-slate-900 mt-2 italic">{stat.value}</h3></div>
                  <div className={cn("p-4 rounded-2xl", stat.bg)}><stat.icon className={cn("w-6 h-6", stat.color)} /></div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "Orders" && (
            <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden">
               <Table>
                 <TableHeader className="bg-slate-50/50"><TableRow className="border-slate-100 h-16"><TableHead className="pl-10 text-[10px] uppercase font-black text-slate-400">Order Ref</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Customer</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Total</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Status</TableHead><TableHead className="pr-10 text-right text-[10px] font-black uppercase text-slate-400">Action</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {orders.map((o) => (
                     <TableRow key={o.id} className="h-20 hover:bg-slate-50 transition-colors">
                       <TableCell className="pl-10 font-black text-xs text-blue-600">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                       <TableCell><div className="flex flex-col"><span className="text-sm font-bold text-slate-900">{o.customer_name}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{o.customer_email}</span></div></TableCell>
                       <TableCell className="text-sm font-black italic">GH₵ {parseFloat(o.total_amount).toLocaleString()}</TableCell>
                       <TableCell><Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-md border-none", o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{o.status}</Badge></TableCell>
                       <TableCell className="pr-10 text-right"><Link href={`/admin/order/${o.id}`}><Button variant="outline" size="sm" className="rounded-xl font-black uppercase text-[9px] h-9 gap-2">View Detail <ChevronRight className="w-3 h-3" /></Button></Link></TableCell>
                     </TableRow>
                   ))}
                   {orders.length === 0 && <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase text-[10px]">No orders processed yet.</TableCell></TableRow>}
                 </TableBody>
               </Table>
            </Card>
          )}

          {activeTab === "Customers" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Find verified shoppers..." className="h-14 pl-12 rounded-2xl bg-white border-none shadow-sm font-bold" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} /></div>
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                 <Table>
                   <TableHeader className="bg-slate-50/50 h-16"><TableRow className="border-slate-50"><TableHead className="pl-10 text-[10px] uppercase font-black text-slate-400">Customer Identity</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Contact</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Location</TableHead><TableHead className="pr-10 text-right text-[10px] font-black uppercase text-slate-400">Manage</TableHead></TableRow></TableHeader>
                   <TableBody>
                     {filteredCustomers.map((c) => (
                       <TableRow key={c.id} className="h-24 hover:bg-slate-50 transition-colors group">
                         <TableCell className="pl-10 py-4">
                           <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                               <AvatarImage src={c.avatar_url} />
                               <AvatarFallback className="bg-blue-50 text-blue-600 font-black">{c.full_name?.[0] || 'U'}</AvatarFallback>
                             </Avatar>
                             <div className="flex flex-col min-w-0">
                               <span className="text-sm font-black text-slate-900 uppercase italic truncate">{c.full_name || 'Anonymous User'}</span>
                               <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{c.email}</span>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell><span className="text-xs font-bold text-slate-600">{c.contact || 'N/A'}</span></TableCell>
                         <TableCell><div className="flex items-center gap-2 text-xs text-slate-400 italic max-w-[200px] truncate"><MapPin className="w-3 h-3 shrink-0" /> {c.location || 'Not Specified'}</div></TableCell>
                         <TableCell className="pr-10 text-right"><Link href={`/admin/customer/${c.id}`}><Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-blue-600 group-hover:bg-white shadow-sm transition-all"><Eye className="w-4 h-4" /></Button></Link></TableCell>
                       </TableRow>
                     ))}
                     {filteredCustomers.length === 0 && <TableRow><TableCell colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-[10px]">No matches in records.</TableCell></TableRow>}
                   </TableBody>
                 </Table>
              </div>
            </div>
          )}

          {activeTab === "Slideshow" && <AdminSlideManager />}

          {activeTab === "Special Offers" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
                    <div>
                       <h2 className="text-2xl font-black uppercase italic">Hardware Promotions</h2>
                       <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Manage special pricing for different configurations.</p>
                    </div>
                    <div className="relative w-full max-sm"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Find hardware..." className="h-14 pl-14 rounded-2xl bg-slate-50 border-none font-bold" value={discountSearch} onChange={(e) => setDiscountSearch(e.target.value)} /></div>
                 </div>
                 <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white"><TableRow className="border-slate-100 h-20"><TableHead className="pl-10 text-[10px] uppercase font-black text-slate-400">Hardware Unit</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Regular Price</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Options</TableHead><TableHead className="pr-10 text-right text-[10px] uppercase font-black text-slate-400">Manage</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {products.filter(p => p.name.toLowerCase().includes(discountSearch.toLowerCase())).map((p) => (
                          <DiscountRow key={p.id} product={p} onSaveVariant={handleSaveVariantDiscount} isSaving={savingDiscountId} />
                        ))}
                      </TableBody>
                    </Table>
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-4 duration-700">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden">
                 <div className="p-10 bg-slate-950 text-white flex items-center justify-between">
                    <div>
                       <h2 className="text-2xl font-black uppercase italic tracking-tight">Store <span className="text-blue-500">Configuration</span></h2>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Global payment credentials</p>
                    </div>
                    <Settings2 className="w-10 h-10 text-blue-500 opacity-50" />
                 </div>
                 <CardContent className="p-10 space-y-10">
                    <form onSubmit={handleSaveSettings} className="space-y-8">
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest">Mobile Money Recipient Name</label>
                             <div className="relative">
                               <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                               <Input placeholder="Account Holder Name" className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold shadow-inner" value={momoDetails.name} onChange={e => setMomoDetails({...momoDetails, name: e.target.value})} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest">Mobile Money Number</label>
                             <div className="relative">
                               <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                               <Input placeholder="e.g. 024XXXXXXX" className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold shadow-inner" value={momoDetails.number} onChange={e => setMomoDetails({...momoDetails, number: e.target.value})} />
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-medium text-blue-800 uppercase leading-relaxed tracking-tight">
                            These details will be displayed to customers on the checkout page when choosing "Pay Before Delivery." 
                            Verification is performed manually via screenshot verification.
                          </p>
                       </div>

                       <Button disabled={isSavingSettings} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-blue-600/20">
                          {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Update Store Credentials
                       </Button>
                    </form>
                 </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "Products" && (
            <div className="space-y-8">
              <div className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Find items..." className="h-14 pl-12 rounded-2xl bg-white border-none shadow-sm font-bold" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} /></div>
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50 h-16"><TableRow className="border-slate-50"><TableHead className="pl-10 text-[10px] uppercase font-black text-slate-400">Hardware Unit</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Catalog Price</TableHead><TableHead className="text-[10px] uppercase font-black text-slate-400">Inventory Status</TableHead><TableHead className="pr-10 text-right text-[10px] font-black uppercase text-slate-400">Manage</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((p) => (
                      <TableRow key={p.id} className="h-24">
                        <TableCell className="pl-10 py-4"><div className="flex items-center gap-6"><div className="w-14 h-14 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100"><Image src={p.image_url} alt={p.name} fill className="object-contain p-2" /></div><span className="text-sm font-black text-slate-900 uppercase italic">{p.name}</span></div></TableCell>
                        <TableCell className="text-sm font-black italic">GH₵ {p.price.toLocaleString()}</TableCell>
                        <TableCell><Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase px-3 py-1">In Stock</Badge></TableCell>
                        <TableCell className="pr-10 text-right space-x-3"><Link href={`/admin/products/edit/${p.id}`}><Button variant="ghost" size="icon" className="text-slate-300 hover:text-blue-600"><Edit className="w-4 h-4" /></Button></Link><Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-600" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                    {products.length === 0 && <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400 font-black uppercase text-[10px]">No items found.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
