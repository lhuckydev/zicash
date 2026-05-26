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
  Truck,
  Zap,
  ShieldAlert,
  UserCheck,
  Eye,
  EyeOff,
  MoreVertical,
  AlertCircle,
  Menu,
  RefreshCcw,
  FileText,
  Search,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Globe,
  Bell,
  Mail,
  Calendar as CalendarIcon,
  CheckSquare,
  CreditCard,
  Target,
  FileBadge,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Image as ImageIcon,
  Monitor,
  Gauge,
  Lock,
  ShieldCheck,
  Receipt,
  Smartphone,
  Save,
  LogOut,
  Tag,
  Calendar,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductVariant } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminTab = "Overview" | "Orders" | "Products" | "Discounting" | "Invoices" | "Customers" | "Analytics" | "History" | "Tasks" | "Settings";

const ADMIN_EMAILS = ['zicashonline@gmail.com', 'ericboatenglucky@gmail.com'];

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
  user_id?: string;
}

interface Customer {
  id: string;
  full_name: string;
  contact: string;
  location: string;
  email: string;
  created_at?: string;
  avatar_url?: string;
}

const SESSION_TIMEOUT = 7200000; 

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#2563eb",
  },
} satisfies ChartConfig;

interface DiscountRowProps {
  product: Product;
  onSaveVariant: (variant: ProductVariant, price: number, date: string) => Promise<void>;
  isSaving: string | null;
}

const DiscountRow = ({ product, onSaveVariant, isSaving }: DiscountRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow className="border-slate-50 group hover:bg-slate-50/30">
        <TableCell className="pl-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl relative border border-slate-100 shrink-0">
              <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-tight">{product.name}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{product.brand}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-xs font-black text-slate-400">GH₵ {product.price.toLocaleString()}</TableCell>
        <TableCell>
          <Badge className="bg-blue-50 text-blue-600 border-none font-bold">
            {product.variants?.length || 0} Options
          </Badge>
        </TableCell>
        <TableCell></TableCell>
        <TableCell className="pr-8 text-right">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 font-bold gap-2"
          >
            {expanded ? "Close Options" : "Manage Discounts"} {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
  onSave: (v: ProductVariant, p: number, d: string) => Promise<void>,
  isSaving: boolean 
}) => {
  const [dPrice, setDPrice] = useState(variant.discount_price || 0);
  const [dDate, setDDate] = useState(variant.discount_ends_at ? variant.discount_ends_at.split('T')[0] : "");

  return (
    <TableRow className="bg-blue-50/20 border-l-4 border-l-blue-600">
      <TableCell className="pl-12 py-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Settings className="w-3 h-3" /></div>
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{variant.label}</span>
        </div>
      </TableCell>
      <TableCell className="text-[11px] font-bold text-slate-400">GH₵ {variant.price.toLocaleString()}</TableCell>
      <TableCell>
        <div className="relative max-w-[130px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600">GH₵</span>
          <input 
            type="number" 
            className="pl-10 w-full h-10 rounded-lg bg-white border-slate-200 text-xs font-bold px-3 focus:outline-none border transition-all" 
            value={dPrice || ""} 
            onChange={(e) => setDPrice(parseFloat(e.target.value))} 
            placeholder="Sale Price"
          />
        </div>
      </TableCell>
      <TableCell>
        <input 
          type="date" 
          className="h-10 w-full rounded-lg bg-white border-slate-200 text-xs font-bold max-w-[150px] px-3 focus:outline-none border transition-all" 
          value={dDate} 
          onChange={(e) => setDDate(e.target.value)} 
        />
      </TableCell>
      <TableCell className="pr-8 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button 
            size="sm"
            onClick={() => onSave(variant, dPrice, dDate)} 
            disabled={isSaving}
            className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 font-bold text-[9px] uppercase tracking-widest gap-2"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Update
          </Button>
          {(variant.discount_price || variant.discount_ends_at) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onSave(variant, 0, "")}
              className="h-10 w-10 rounded-lg text-red-400 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
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
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("Overview");
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [discountSearch, setDiscountSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");

  const [momoName, setMomoName] = useState("Kanisatu Fouseni");
  const [momoNumber, setMomoNumber] = useState("0243708691");

  const [savingDiscountId, setSavingDiscountId] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, oRes, cRes, sRes] = await Promise.all([
        supabase.from('products').select('*, variants:product_variants(*)').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('key', 'momo_payment_details').maybeSingle()
      ]);
      
      if (pRes.data) setProducts(pRes.data);
      if (oRes.data) setOrders(oRes.data);
      if (cRes.data) setCustomers(cRes.data);
      
      if (sRes.data) {
        setMomoName(sRes.data.value.name || "Kanisatu Fouseni");
        setMomoNumber(sRes.data.value.number || "0243708691");
      }
    } catch (err: any) {
      console.error("Store Update Error:", err);
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
      toast({ variant: "destructive", title: "Access Denied", description: "Your account is not on the administrator whitelist." });
      return;
    }

    if (password === "zicashadmin") {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setIsAuthenticated(true);
    } else {
      toast({ variant: "destructive", title: "Denied", description: "Incorrect login credentials." });
    }
  };

  const handleSaveVariantDiscount = async (variant: ProductVariant, dPrice: number, dDate: string) => {
    setSavingDiscountId(variant.id);
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({
          discount_price: dPrice || null,
          discount_ends_at: dDate || null,
        })
        .eq('id', variant.id);

      if (error) throw error;
      toast({ title: "Pricing Updated", description: `Discount applied to ${variant.label}.` });
      fetchAllData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setSavingDiscountId(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_last_activity');
    setIsAuthenticated(false);
    await supabase.auth.signOut();
    router.push('/');
    toast({ title: "Logged Out", description: "Administrator session ended." });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Remove this item from store?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Removed", description: "Item removed from store records." });
      fetchAllData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const approvedOrders = useMemo(() => 
    orders.filter(o => o.status !== "Pending" && o.status !== "Cancelled"), 
  [orders]);

  const totalRevenue = useMemo(() => 
    approvedOrders.reduce((acc, o) => acc + (parseFloat(o.total_amount?.toString() || "0") || 0), 0), 
  [approvedOrders]);

  const activeOrdersCount = useMemo(() => 
    orders.filter(o => o.status === "Pending").length, 
  [orders]);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) && 
      (productCategory === "all" || p.category === productCategory)
    ), 
  [products, productSearch, productCategory]);

  const filteredDiscounting = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(discountSearch.toLowerCase())
    ), 
  [products, discountSearch]);

  const SidebarItem = ({ tab, icon: Icon, active, onClick, children }: any) => (
    <button onClick={onClick} className={cn("flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-left", active ? "bg-blue-600 text-white" : "text-white/50 hover:bg-white/5 hover:text-white")}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        <span>{tab}</span>
      </div>
      {children}
    </button>
  );

  const SubItem = ({ tab, active, onClick }: any) => (
    <button onClick={onClick} className={cn("flex items-center gap-3 w-full pl-11 py-2 rounded-lg text-xs font-medium transition-all text-left", active ? "text-white" : "text-white/40 hover:text-white")}>
      <span className={cn("w-1 h-1 rounded-full", active ? "bg-white" : "bg-white/20")} />
      {tab}
    </button>
  );

  const AdminSidebarContent = () => (
    <>
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white">
          <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" fill className="object-cover" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">ZiCash Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <nav className="space-y-1">
          <SidebarItem tab="Overview" icon={LayoutDashboard} active={activeTab === "Overview"} onClick={() => { setActiveTab("Overview"); setIsMobileMenuOpen(false); }} />
          <div className="space-y-1">
            <SidebarItem tab="Store" icon={Package} active={["Orders", "Products", "Discounting", "Invoices"].includes(activeTab)} onClick={() => setIsStoreOpen(!isStoreOpen)}>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isStoreOpen ? "" : "-rotate-90")} />
            </SidebarItem>
            {isStoreOpen && (
              <div className="space-y-1">
                <SubItem tab="Orders" active={activeTab === "Orders"} onClick={() => { setActiveTab("Orders"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Products" active={activeTab === "Products"} onClick={() => { setActiveTab("Products"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Discounting" active={activeTab === "Discounting"} onClick={() => { setActiveTab("Discounting"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Invoices" active={activeTab === "Invoices"} onClick={() => { setActiveTab("Invoices"); setIsMobileMenuOpen(false); }} />
              </div>
            )}
          </div>
          <SidebarItem tab="Customers" icon={Users} active={activeTab === "Customers"} onClick={() => { setActiveTab("Customers"); setIsMobileMenuOpen(false); }} />
          <SidebarItem tab="Settings" icon={Settings} active={activeTab === "Settings"} onClick={() => { setActiveTab("Settings"); setIsMobileMenuOpen(false); }} />
        </nav>
      </div>
      <div className="p-4 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-50">
          <LogOut className="w-4 h-4" /> <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[#F1F5F9] tech-grid">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-[#0F172A] p-10 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl p-3 shadow-2xl mb-6"><Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={64} height={64} className="object-cover rounded-lg" /></div>
              <h1 className="text-white font-black text-2xl uppercase">ZiCash Admin</h1>
            </div>
          </div>
          <CardContent className="p-10 space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <Input type={showPassword ? "text" : "password"} placeholder="Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-bold rounded-2xl text-white uppercase tracking-widest">Sign In</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body">
      <aside className="hidden lg:flex w-64 bg-slate-950 flex-col shadow-xl z-50 shrink-0 text-white">
        <AdminSidebarContent />
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="w-5 h-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="p-0 bg-slate-950 border-none w-[280px] flex flex-col rounded-r-3xl overflow-hidden"><AdminSidebarContent /></SheetContent>
            </Sheet>
            <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search store..." className="bg-slate-50 border-none rounded-xl h-10 pl-10 text-xs w-full" /></div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchAllData} 
              disabled={isLoading}
              className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mr-4"><Eye className="w-4 h-4" /> Visit Store</Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide pb-24">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-slate-900 font-headline uppercase">{activeTab === "Overview" ? "Dashboard Summary" : activeTab}</h1>
            <Button 
              variant="outline" 
              onClick={fetchAllData} 
              disabled={isLoading}
              className="lg:hidden h-10 rounded-xl bg-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm"
            >
              <RefreshCcw className={cn("w-3 h-3", isLoading && "animate-spin")} /> Refresh
            </Button>
          </div>

          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                { label: "Total Revenue", value: `GH₵ ${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: "bg-blue-50", color: "text-blue-600" },
                { label: "Products in Store", value: products.length, icon: Box, bg: "bg-indigo-50", color: "text-indigo-600" },
                { label: "Pending Orders", value: activeOrdersCount, icon: Clock, bg: "bg-orange-50", color: "text-orange-600" },
                { label: "Active Customers", value: customers.length, icon: UserCheck, bg: "bg-blue-50", color: "text-blue-600" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-2xl p-6 flex items-center justify-between bg-white hover:shadow-md transition-shadow">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p><h3 className="text-2xl font-black text-slate-900 mt-1 italic tracking-tighter">{stat.value}</h3></div>
                  <div className={cn("p-3 rounded-xl", stat.bg)}><stat.icon className={cn("w-5 h-5", stat.color)} /></div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "Products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center"><Input placeholder="Search items..." className="max-w-md h-12 rounded-2xl bg-white border-slate-100 shadow-sm" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} /><Link href="/admin/products/new"><Button className="bg-blue-600 px-8 rounded-2xl font-bold gap-3 shadow-lg shadow-blue-600/20"><Plus className="w-4 h-4" /> Add Product</Button></Link></div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50"><TableRow className="border-slate-50"><TableHead className="pl-8 text-[10px] uppercase font-black">Product</TableHead><TableHead className="text-[10px] uppercase font-black">Price</TableHead><TableHead className="text-[10px] uppercase font-black">Stock</TableHead><TableHead className="pr-8 text-right text-[10px] uppercase font-black">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <TableCell className="pl-8 py-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100"><Image src={p.image_url} alt={p.name} fill className="object-contain p-1" /></div><span className="text-xs font-bold">{p.name}</span></div></TableCell>
                        <TableCell className="text-xs font-black">GH₵ {p.price.toLocaleString()}</TableCell>
                        <TableCell><Badge className="bg-blue-50 text-blue-600 border-none font-bold">In Stock</Badge></TableCell>
                        <TableCell className="pr-8 text-right space-x-2"><Link href={`/admin/products/edit/${p.id}`}><Button variant="ghost" size="icon" className="text-slate-300 hover:text-blue-600"><Edit className="w-4 h-4" /></Button></Link><Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-600" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "Discounting" && (
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-tight">Active Promotions</h2>
                       <p className="text-xs text-slate-400 mt-1 font-medium">Set individual discounts for specific hardware specifications.</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative w-full max-w-sm">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                             placeholder="Search products for discount..." 
                             className="h-12 pl-11 rounded-2xl bg-slate-50 border-none font-bold" 
                             value={discountSearch} 
                             onChange={(e) => setDiscountSearch(e.target.value)} 
                          />
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow className="border-slate-100">
                          <TableHead className="pl-8 text-[9px] uppercase font-black tracking-[0.2em] py-5">Product / Option</TableHead>
                          <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-5">Standard Rate</TableHead>
                          <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-5">Sale Price (GHS)</TableHead>
                          <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-5">Offer Expiry</TableHead>
                          <TableHead className="pr-8 text-right text-[9px] uppercase font-black tracking-[0.2em] py-5">Control</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDiscounting.map((p) => (
                          <DiscountRow 
                            key={p.id} 
                            product={p} 
                            onSaveVariant={handleSaveVariantDiscount} 
                            isSaving={savingDiscountId} 
                          />
                        ))}
                      </TableBody>
                    </Table>
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "Orders" && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50"><TableRow className="border-slate-50"><TableHead className="pl-8 text-[10px] font-black uppercase">Order ID</TableHead><TableHead className="text-[10px] font-black uppercase">Customer</TableHead><TableHead className="text-[10px] font-black uppercase">Amount</TableHead><TableHead className="text-[10px] font-black uppercase">Status</TableHead><TableHead className="pr-8 text-right text-[10px] font-black uppercase">View</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="cursor-pointer hover:bg-slate-50/30 transition-colors" onClick={() => router.push(`/admin/order/${o.id}`)}>
                      <TableCell className="pl-8 font-black text-xs text-blue-600">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-xs font-bold">{o.customer_name}</TableCell>
                      <TableCell className="text-xs font-black italic">GH₵ {parseFloat(o.total_amount).toLocaleString()}</TableCell>
                      <TableCell><Badge className={cn("text-[9px] font-black uppercase px-2 py-0.5", o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{o.status}</Badge></TableCell>
                      <TableCell className="pr-8 text-right"><ChevronRight className="w-4 h-4 ml-auto text-slate-200" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
