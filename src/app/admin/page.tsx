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
  X
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

type AdminTab = "Overview" | "Orders" | "Products" | "Special Offers" | "Invoices" | "Customers" | "Settings";

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
  created_at?: string;
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
              <span className="text-sm font-black text-slate-900 leading-tight uppercase truncate max-w-[300px]">{product.name}</span>
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">{product.brand || 'Premium Brand'}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Base Price</span>
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
              expanded ? "bg-slate-900 text-white border-slate-900" : "bg-white text-blue-600 border-blue-100 hover:bg-blue-50"
            )}
          >
            {expanded ? "Close Offers" : "Edit Offers"} {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
  const [dPrice, setDPrice] = useState<number | null>(variant.discount?.discount_price ?? null);
  const [dDate, setDDate] = useState(variant.discount?.ends_at ? variant.discount.ends_at.split('T')[0] : "");

  const handlePriceChange = (val: string) => {
    if (val === "") {
      setDPrice(null);
    } else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) setDPrice(parsed);
    }
  };

  return (
    <TableRow className="bg-slate-50/50 border-l-4 border-l-blue-600">
      <TableCell className="pl-12 py-4" colSpan={4}>
        <div className="max-w-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          
          <div className="flex items-center gap-4 min-w-[150px]">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Settings2 className="w-5 h-5" /></div>
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight">{variant.label}</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Rate: <span className="text-slate-600 font-black">GH₵ {variant.price.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1 max-w-[140px]">
             <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">New Sale Price</label>
             <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 pointer-events-none">GHS</div>
                <input 
                  type="number" 
                  step="0.01"
                  className="pl-11 w-full h-11 rounded-xl bg-slate-50 border-transparent text-sm font-black italic px-4 focus:outline-none border-2 focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
                  value={dPrice ?? ""} 
                  onChange={(e) => handlePriceChange(e.target.value)} 
                  placeholder="0.00"
                />
             </div>
          </div>

          <div className="flex flex-col gap-1 flex-1 max-w-[140px]">
             <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Offer Expiry</label>
             <input 
               type="date" 
               className="h-11 w-full rounded-xl bg-slate-50 border-transparent text-[10px] font-black uppercase tracking-tight px-4 focus:outline-none border-2 focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
               value={dDate} 
               onChange={(e) => setDDate(e.target.value)} 
             />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={() => onSave(variant.id, dPrice, dDate)} 
              disabled={isSaving}
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-blue-600/10 transition-all"
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
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [discountSearch, setDiscountSearch] = useState("");
  const [savingDiscountId, setSavingDiscountId] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Strictly use explicit join for discount logic
      const { data: pData, error: pError } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))')
        .order('created_at', { ascending: false });
      
      if (pError) {
        console.warn("Pricing Table Sync Required. Check RLS or existence of 'discounts' table.");
        // Fallback fetch
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*, variants:product_variants(*)')
          .order('created_at', { ascending: false });
        
        if (fallbackData) setProducts(fallbackData);
      } else if (pData) {
        setProducts(pData);
      }

      const [oRes, cRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ]);
      
      if (oRes.data) setOrders(oRes.data);
      if (cRes.data) setCustomers(cRes.data);
      
    } catch (err: any) {
      console.error("Manager Hub Sync Error:", err);
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
      toast({ variant: "destructive", title: "Access Denied", description: "This account is not authorized for management." });
      return;
    }

    if (password === "zicashadmin") {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setIsAuthenticated(true);
    } else {
      toast({ variant: "destructive", title: "Denied", description: "Incorrect passkey." });
    }
  };

  const handleSaveVariantDiscount = async (variantId: string, dPrice: number | null, dDate: string) => {
    setSavingDiscountId(variantId);
    try {
      if (dPrice === null || dPrice === 0 || !dDate) {
        const { error } = await supabase
          .from('discounts')
          .delete()
          .eq('variant_id', variantId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discounts')
          .upsert({
            variant_id: variantId,
            discount_price: dPrice,
            ends_at: new Date(dDate).toISOString(),
          }, { onConflict: 'variant_id' });

        if (error) throw error;
      }
      
      toast({ title: "Pricing Updated", description: `Special offer applied successfully.` });
      fetchAllData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message || "Permission error. Ensure SQL RLS policies are active." });
    } finally {
      setSavingDiscountId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Permanently remove this hardware unit from the catalog?")) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Item Removed", description: "The product has been deleted." });
      fetchAllData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Failed", description: err.message });
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
    toast({ title: "Logged Out", description: "Manager session ended." });
  };

  const totalRevenue = useMemo(() => 
    orders.filter(o => o.status === "Delivered")
      .reduce((acc, o) => acc + (parseFloat(o.total_amount?.toString() || "0") || 0), 0), 
  [orders]);

  const SidebarItem = ({ tab, icon: Icon, active, onClick, children }: any) => (
    <button onClick={onClick} className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-sm font-bold text-left", active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/50 hover:bg-white/5 hover:text-white")}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        <span className="uppercase tracking-widest text-[11px]">{tab}</span>
      </div>
      {children}
    </button>
  );

  const SubItem = ({ tab, active, onClick }: any) => (
    <button onClick={onClick} className={cn("flex items-center gap-3 w-full pl-11 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all text-left", active ? "text-white" : "text-white/40 hover:text-white")}>
      <span className={cn("w-1 h-1 rounded-full", active ? "bg-white" : "bg-white/20")} />
      {tab}
    </button>
  );

  const AdminSidebarContent = () => (
    <>
      <div className="p-8 border-b border-white/5 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-white">
          <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" fill className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-white leading-none">ZiCash GH</span>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Manager Hub</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <nav className="space-y-2">
          <SidebarItem tab="Overview" icon={LayoutDashboard} active={activeTab === "Overview"} onClick={() => { setActiveTab("Overview"); setIsMobileMenuOpen(false); }} />
          <div className="space-y-1">
            <SidebarItem tab="Store" icon={Package} active={["Orders", "Products", "Special Offers"].includes(activeTab)} onClick={() => setIsStoreOpen(!isStoreOpen)}>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isStoreOpen ? "" : "-rotate-90")} />
            </SidebarItem>
            {isStoreOpen && (
              <div className="space-y-1">
                <SubItem tab="Orders" active={activeTab === "Orders"} onClick={() => { setActiveTab("Orders"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Products" active={activeTab === "Products"} onClick={() => { setActiveTab("Products"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Special Offers" active={activeTab === "Special Offers"} onClick={() => { setActiveTab("Special Offers"); setIsMobileMenuOpen(false); }} />
              </div>
            )}
          </div>
          <SidebarItem tab="Customers" icon={Users} active={activeTab === "Customers"} onClick={() => { setActiveTab("Customers"); setIsMobileMenuOpen(false); }} />
          <SidebarItem tab="Settings" icon={Settings} active={activeTab === "Settings"} onClick={() => { setActiveTab("Settings"); setIsMobileMenuOpen(false); }} />
        </nav>
      </div>
      <div className="p-6 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-50">
          <LogOut className="w-4 h-4" /> <span>End Session</span>
        </button>
      </div>
    </>
  );

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[#F1F5F9] tech-grid">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-slate-950 p-12 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-2xl p-4 shadow-2xl mb-6"><Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={80} height={80} className="object-cover rounded-lg" /></div>
              <h1 className="text-white font-black text-2xl uppercase tracking-tight">ZiCash <span className="text-blue-500 italic">Manager</span></h1>
            </div>
          </div>
          <CardContent className="p-12 space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Entry Passkey</label>
                 <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-black text-center text-xl tracking-[0.5em]" />
              </div>
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl text-white uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20">Authorize Access</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body">
      <aside className="hidden lg:flex w-72 bg-slate-950 flex-col shadow-2xl z-50 shrink-0 text-white">
        <AdminSidebarContent />
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="w-5 h-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="p-0 bg-slate-950 border-none w-[300px] flex flex-col rounded-r-[2.5rem] overflow-hidden shadow-2xl"><AdminSidebarContent /></SheetContent>
            </Sheet>
            <div className="relative w-full max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search catalog..." className="bg-slate-50 border-none rounded-xl h-11 pl-12 text-xs font-bold w-full" /></div>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={fetchAllData} disabled={isLoading} className="h-10 w-10 rounded-xl"><RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} /></Button>
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest"><Eye className="w-4 h-4" /> Storefront</Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide pb-24">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ZiCash Operations</div>
               <h1 className="text-4xl font-black text-slate-900 font-headline uppercase italic">{activeTab}</h1>
            </div>
          </div>

          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                { label: "Sales Revenue", value: `GH₵ ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Catalog Size", value: products.length, icon: Box, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Active Orders", value: orders.filter(o => o.status === "Pending").length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                { label: "Total Users", value: customers.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl p-8 flex items-center justify-between bg-white">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p><h3 className="text-3xl font-black text-slate-900 mt-2 italic">{stat.value}</h3></div>
                  <div className={cn("p-4 rounded-2xl", stat.bg)}><stat.icon className={cn("w-6 h-6", stat.color)} /></div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "Special Offers" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
                    <div>
                       <h2 className="text-2xl font-black uppercase italic">Hardware Promotions</h2>
                       <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Set specific sale prices for your premium configurations.</p>
                    </div>
                    <div className="relative w-full max-w-sm">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input 
                          placeholder="Search items..." 
                          className="h-14 pl-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" 
                          value={discountSearch} 
                          onChange={(e) => setDiscountSearch(e.target.value)} 
                       />
                    </div>
                 </div>
                 
                 <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow className="border-slate-100 h-20">
                          <TableHead className="pl-10 text-[10px] uppercase font-black tracking-widest text-slate-400">Hardware Unit</TableHead>
                          <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400">Regular Rate</TableHead>
                          <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400">Availability</TableHead>
                          <TableHead className="pr-10 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Controls</TableHead>
                        </TableRow>
                      </TableHeader>
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

          {activeTab === "Products" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Find items..." className="h-14 pl-12 rounded-2xl bg-white border-slate-100 shadow-sm font-bold" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} /></div>
                <Link href="/admin/products/new"><Button className="bg-blue-600 hover:bg-blue-700 px-10 h-14 rounded-2xl font-black uppercase text-[11px] gap-3 shadow-xl"><Plus className="w-5 h-5" /> New Product</Button></Link>
              </div>
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50 h-16"><TableRow className="border-slate-50"><TableHead className="pl-10 text-[10px] uppercase font-black tracking-widest text-slate-400">Hardware Unit</TableHead><TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400">Catalog Price</TableHead><TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400">Inventory</TableHead><TableHead className="pr-10 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Manage</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((p) => (
                      <TableRow key={p.id} className="h-24">
                        <TableCell className="pl-10 py-4"><div className="flex items-center gap-6"><div className="w-14 h-14 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100"><Image src={p.image_url} alt={p.name} fill className="object-contain p-2" /></div><span className="text-sm font-black text-slate-900 uppercase italic">{p.name}</span></div></TableCell>
                        <TableCell className="text-sm font-black italic">GH₵ {p.price.toLocaleString()}</TableCell>
                        <TableCell><Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase px-3 py-1">In Stock</Badge></TableCell>
                        <TableCell className="pr-10 text-right space-x-3"><Link href={`/admin/products/edit/${p.id}`}><Button variant="ghost" size="icon" className="text-slate-300 hover:text-blue-600"><Edit className="w-4 h-4" /></Button></Link><Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-600" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
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
