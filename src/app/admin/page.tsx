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
  LogOut
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
import { Product } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminTab = "Overview" | "Orders" | "Products" | "Invoices" | "Customers" | "Analytics" | "History" | "Tasks" | "Settings";

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

const SESSION_TIMEOUT = 7200000; // 2 hours

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#2563eb",
  },
} satisfies ChartConfig;

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
  const [productCategory, setProductCategory] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");

  // MoMo Settings State
  const [momoName, setMomoName] = useState("Kanisatu Fouseni");
  const [momoNumber, setMomoNumber] = useState("0243708691");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, oRes, cRes, sRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
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
      console.error("Admin Update Error:", err);
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
      toast({ variant: "destructive", title: "Access Denied", description: "Your account is not on the admin list." });
      return;
    }

    if (password === "zicashadmin") {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setIsAuthenticated(true);
    } else {
      toast({ variant: "destructive", title: "Denied", description: "Incorrect password." });
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in again.");

      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'momo_payment_details',
          value: { name: momoName, number: momoNumber },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      toast({ title: "Settings Updated", description: "Payment details saved for the store." });
    } catch (err: any) {
      console.error("Settings Update Failed:", err);
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: err.message || "Please check your permissions." 
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_last_activity');
    setIsAuthenticated(false);
    await supabase.auth.signOut();
    router.push('/');
    toast({ title: "Logged Out", description: "Admin session ended." });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Remove this item from store?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Removed", description: "Item removed from inventory." });
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

  const chartData = useMemo(() => {
    const performance: Record<string, number> = {};
    approvedOrders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item: any) => {
        performance[item.name] = (performance[item.name] || 0) + (parseFloat(item.price || 0) * (item.quantity || 0));
      });
    });
    return Object.entries(performance).slice(0, 10).map(([name, revenue]) => ({
      name: name.split(' ').slice(0, 2).join(' '),
      revenue
    }));
  }, [approvedOrders]);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) && 
      (productCategory === "all" || p.category === productCategory)
    ), 
  [products, productSearch, productCategory]);

  const customerPerformance = useMemo(() => {
    return customers.map(c => {
      const cOrders = orders.filter(o => (o.user_id === c.id || o.customer_email === c.email) && o.status !== "Cancelled");
      return { 
        ...c, 
        totalOrders: cOrders.length, 
        totalSpend: cOrders.reduce((acc, o) => acc + (parseFloat(o.total_amount || 0)), 0) 
      };
    }).filter(c => (c.full_name || "").toLowerCase().includes(customerSearch.toLowerCase()) || (c.email || "").toLowerCase().includes(customerSearch.toLowerCase()));
  }, [customers, orders, customerSearch]);

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
          <Image 
            src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
            alt="ZiCash GH Limited Admin" 
            fill
            className="object-cover"
          />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">Zi<span className="text-blue-500">Cash GH</span> Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <nav className="space-y-1">
          <SidebarItem tab="Overview" icon={LayoutDashboard} active={activeTab === "Overview"} onClick={() => { setActiveTab("Overview"); setIsMobileMenuOpen(false); }} />
          <div className="space-y-1">
            <SidebarItem tab="Store" icon={Package} active={["Orders", "Products", "Invoices"].includes(activeTab)} onClick={() => setIsStoreOpen(!isStoreOpen)}>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isStoreOpen ? "" : "-rotate-90")} />
            </SidebarItem>
            {isStoreOpen && (
              <div className="space-y-1">
                <SubItem tab="Orders" active={activeTab === "Orders"} onClick={() => { setActiveTab("Orders"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Products" active={activeTab === "Products"} onClick={() => { setActiveTab("Products"); setIsMobileMenuOpen(false); }} />
                <SubItem tab="Invoices" active={activeTab === "Invoices"} onClick={() => { setActiveTab("Invoices"); setIsMobileMenuOpen(false); }} />
              </div>
            )}
          </div>
          <SidebarItem tab="Customers" icon={Users} active={activeTab === "Customers"} onClick={() => { setActiveTab("Customers"); setIsMobileMenuOpen(false); }} />
          <SidebarItem tab="Analytics" icon={TrendingUp} active={activeTab === "Analytics"} onClick={() => { setActiveTab("Analytics"); setIsMobileMenuOpen(false); }} />
          <SidebarItem tab="History" icon={CalendarIcon} active={activeTab === "History"} onClick={() => { setActiveTab("History"); setIsMobileMenuOpen(false); }} />
          <SidebarItem tab="Tasks" icon={CheckSquare} active={activeTab === "Tasks"} onClick={() => { setActiveTab("Tasks"); setIsMobileMenuOpen(false); }} />
        </nav>
      </div>
      <div className="p-4 border-t border-white/5 space-y-1">
        <SidebarItem tab="Settings" icon={Settings} active={activeTab === "Settings"} onClick={() => { setActiveTab("Settings"); setIsMobileMenuOpen(false); }} />
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[#F1F5F9] tech-grid">
        <Card className="w-full max-w-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-none rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
          <div className="bg-[#0F172A] p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <div className="absolute inset-0 tech-grid" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl p-3 shadow-2xl mb-6 transform hover:rotate-6 transition-transform">
                <Image 
                  src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                  alt="ZiCash GH Limited Admin" 
                  width={64}
                  height={64}
                  className="object-cover rounded-lg"
                />
              </div>
              <h1 className="text-white font-black text-3xl font-headline tracking-tight uppercase leading-none">
                ZiCash GH <span className="text-blue-500 italic block mt-1 text-sm font-bold tracking-[0.3em]">Admin Panel</span>
              </h1>
            </div>
          </div>
          
          <CardContent className="p-10 space-y-8">
            <div className="space-y-2 text-center">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Restricted Area</p>
               <h2 className="text-xl font-bold text-slate-900">Admin Login</h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter admin password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-14 rounded-2xl bg-slate-50 border-none pl-12 pr-12 font-medium focus-visible:ring-blue-600/20" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 font-black rounded-2xl text-white uppercase tracking-[0.15em] text-xs transition-all hover:scale-[1.02] active:scale-95">
                  Sign In
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure System Active
                </div>
              </div>
            </form>
          </CardContent>
          
          <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
             <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
               <ArrowRight className="w-3 h-3 rotate-180" /> Back to Store
             </Link>
          </div>
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
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-500">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-slate-950 border-none w-[280px] flex flex-col">
                <AdminSidebarContent />
              </SheetContent>
            </Sheet>
            <div className="relative w-full max-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search store..." className="bg-slate-50 border-none rounded-xl h-10 pl-10 w-full text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mr-4 hover:opacity-70 transition-opacity"><Eye className="w-4 h-4" /> Visit Store</Link>
            <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-slate-100">
              <AvatarImage src="https://i.ibb.co/v4p0sdxs/zicash.jpg" />
              <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-black">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide pb-24">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Admin</span> <ChevronRight className="w-3 h-3" /> <span className="text-slate-900">{activeTab}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 font-headline">{activeTab}</h1>
          </div>

          {activeTab === "Overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Approved Revenue", value: `GH₵ ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Products in Store", value: products.length, icon: Box, color: "text-indigo-600", bg: "bg-indigo-50" },
                  { label: "Pending Orders", value: activeOrdersCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "Customers", value: customers.length, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl p-6 flex items-center justify-between bg-white hover:shadow-xl transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1 italic tracking-tighter">{stat.value}</h3>
                    </div>
                    <div className={cn("p-3 rounded-xl shadow-inner", stat.bg)}><stat.icon className={cn("w-5 h-5", stat.color)} /></div>
                  </Card>
                ))}
              </div>
              <Card className="border-none shadow-sm rounded-[2rem] p-8 bg-white">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Sales <span className="text-blue-600">Report</span></CardTitle>
                  <CardDescription className="text-xs">Based on completed orders</CardDescription>
                </CardHeader>
                <div className="h-[300px]">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "Orders" && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50 hover:bg-transparent">
                    <TableHead className="pl-8 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Order #</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Customer</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Amount</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                    <TableHead className="pr-8 text-right font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="group cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => router.push(`/admin/order/${o.id}`)}>
                      <TableCell className="pl-8 font-black text-xs text-blue-600">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{o.customer_name}</TableCell>
                      <TableCell className="text-xs font-black italic tracking-tighter">GH₵ {parseFloat(o.total_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm", 
                          o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : 
                          o.status === "Cancelled" ? "bg-red-50 text-red-600" :
                          "bg-blue-50 text-blue-600"
                        )}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right"><ChevronRight className="w-4 h-4 ml-auto text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "Products" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input placeholder="Search items..." className="max-w-md h-12 rounded-2xl pl-12 bg-white border-slate-100" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                </div>
                <Link href="/admin/products/new">
                  <Button 
                    className="w-full md:w-auto h-12 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </Button>
                </Link>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-50 hover:bg-transparent">
                      <TableHead className="pl-8 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Product</TableHead>
                      <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Category</TableHead>
                      <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Price</TableHead>
                      <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Stock</TableHead>
                      <TableHead className="pr-8 text-right font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl p-1 relative border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
                               <Image src={p.image_url} alt={p.name} fill className="object-contain p-1" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">{p.name}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] font-black uppercase text-slate-400">{p.category}</TableCell>
                        <TableCell className="text-xs font-black italic tracking-tighter text-slate-900">GH₵ {p.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none shadow-inner", p.stock < 5 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")}>
                            {p.stock} Units
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right space-x-2">
                          <Link href={`/admin/products/edit/${p.id}`}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "Customers" && (
            <div className="space-y-6">
              <div className="relative w-full max-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input placeholder="Search customers..." className="h-12 rounded-2xl pl-12 bg-white border-slate-100" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-50 hover:bg-transparent">
                      <TableHead className="pl-8 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Customer Name</TableHead>
                      <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Email Address</TableHead>
                      <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Orders</TableHead>
                      <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Total Spent</TableHead>
                      <TableHead className="pr-8 text-right font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPerformance.map((c) => (
                      <TableRow key={c.id} className="group cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => router.push(`/admin/customer/${c.id}`)}>
                        <TableCell className="pl-8 py-4">
                           <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-slate-100 shadow-sm">
                                <AvatarImage src={c.avatar_url} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-[10px]">{c.full_name?.[0] || 'G'}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{c.full_name || "Guest Customer"}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-500">{c.email}</TableCell>
                        <TableCell className="text-xs font-black text-slate-900">{c.totalOrders}</TableCell>
                        <TableCell className="text-xs font-black italic tracking-tighter text-blue-600">GH₵ {c.totalSpend.toLocaleString()}</TableCell>
                        <TableCell className="pr-8 text-right"><ArrowRight className="w-4 h-4 ml-auto text-slate-200 group-hover:text-blue-600 transition-all" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "Analytics" && (
             <div className="space-y-8 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Total <span className="text-blue-600 italic">Revenue</span></CardTitle>
                      <CardDescription className="text-xs">Sales data from completed orders</CardDescription>
                    </CardHeader>
                    <div className="h-[300px]">
                      <ChartContainer config={chartConfig}>
                        <BarChart data={chartData}>
                          <CartesianGrid vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </Card>

                  <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Order <span className="text-blue-600 italic">Stats</span></CardTitle>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status Mix</h4>
                    </CardHeader>
                    <div className="space-y-6">
                       {[
                         { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, total: orders.length, color: "bg-emerald-500" },
                         { label: "Processing", value: orders.filter(o => o.status === "Processing" || o.status === "Shipped").length, total: orders.length, color: "bg-blue-500" },
                         { label: "Pending", value: orders.filter(o => o.status === "Pending").length, total: orders.length, color: "bg-orange-500" },
                         { label: "Cancelled", value: orders.filter(o => o.status === "Cancelled").length, total: orders.length, color: "bg-red-500" },
                       ].map((m, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-slate-400">{m.label}</span>
                               <span className="text-slate-900">{m.value} Orders</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                               <div className={cn("h-full transition-all duration-1000", m.color)} style={{ width: `${(m.value / (m.total || 1)) * 100}%` }} />
                            </div>
                         </div>
                       ))}
                    </div>
                  </Card>
               </div>
             </div>
          )}

          {activeTab === "Invoices" && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50 hover:bg-transparent">
                    <TableHead className="pl-8 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Invoice #</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Date</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Customer</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Amount</TableHead>
                    <TableHead className="pr-8 text-right font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter(o => o.status === "Delivered").map((o) => (
                    <TableRow key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-8 text-xs font-mono font-black text-blue-600 uppercase">INV-{o.id.slice(0, 6)}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-500">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs font-black text-slate-900">{o.customer_name}</TableCell>
                      <TableCell className="text-xs font-black italic tracking-tighter">GH₵ {parseFloat(o.total_amount).toLocaleString()}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <Link href={`/admin/invoice/${o.id}`}>
                          <Button variant="ghost" size="sm" className="rounded-lg hover:bg-blue-50 hover:text-blue-600 gap-2 font-black text-[10px] uppercase tracking-widest">
                            <Receipt className="w-4 h-4" /> View Invoice
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.filter(o => o.status === "Delivered").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-slate-300 font-black uppercase text-[10px] tracking-widest">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "History" && (
            <Card className="border-none shadow-sm rounded-[2rem] p-8 bg-white overflow-hidden">
              <div className="space-y-12">
                {orders.slice(0, 15).map((o, i) => (
                  <div key={o.id} className="flex gap-8 items-start border-l-2 border-blue-500/20 pl-8 pb-12 relative last:pb-0">
                    <div className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-xl", o.status === "Cancelled" ? "bg-red-600 shadow-red-600/30" : "bg-blue-600 shadow-blue-600/30")} />
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">{new Date(o.created_at).toLocaleString()}</p>
                      <h4 className="font-black text-slate-900 text-lg tracking-tight">Order #{o.id.slice(0, 8).toUpperCase()} placed</h4>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-6 max-w-md">
                         <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 overflow-hidden">
                            <Image src={o.items[0]?.image_url || ''} alt="item" width={32} height={32} className="object-contain" />
                         </div>
                         <p className="text-xs font-medium text-slate-500 leading-relaxed">
                           <span className="font-black text-slate-900">{o.customer_name}</span> bought items worth <span className="font-black text-blue-600">GH₵{parseFloat(o.total_amount).toLocaleString()}</span>
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "Tasks" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] p-8 space-y-8 bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-600 flex items-center gap-3"><Clock className="w-4 h-4" /> Pending Orders</CardTitle>
                  <Badge className="bg-orange-50 text-orange-600 border-none text-[8px] font-black uppercase">{orders.filter(o => o.status === "Pending").length} Items</Badge>
                </div>
                <div className="space-y-4">
                  {orders.filter(o => o.status === "Pending").map(o => (
                    <div key={o.id} className="p-6 rounded-[2rem] bg-orange-50/50 border border-orange-100/50 space-y-3 hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/order/${o.id}`)}>
                       <div className="flex justify-between items-start">
                         <span className="font-black text-xs text-orange-900">Confirm Payment</span>
                         <Badge className="bg-orange-600 text-[8px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20">Action Needed</Badge>
                       </div>
                       <p className="text-[11px] text-orange-800/60 font-medium leading-relaxed">Check payment for order #{o.id.slice(0, 6)} from {o.customer_name}</p>
                    </div>
                  ))}
                  {orders.filter(o => o.status === "Pending").length === 0 && (
                    <div className="text-center py-20 text-slate-300 font-black uppercase text-[10px] tracking-widest">No pending tasks</div>
                  )}
                </div>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] p-8 space-y-8 bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-3"><Truck className="w-4 h-4" /> Ready to Ship</CardTitle>
                  <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase">{orders.filter(o => o.status === "Processing").length} Active</Badge>
                </div>
                <div className="space-y-4">
                  {orders.filter(o => o.status === "Processing").map(o => (
                    <div key={o.id} className="p-6 rounded-[2rem] bg-orange-50/50 border border-blue-100/50 space-y-3 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/order/${o.id}`)}>
                       <div className="flex justify-between items-start">
                         <span className="font-black text-xs text-blue-900">Prepare Delivery</span>
                         <Badge className="bg-blue-600 text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Ready</Badge>
                       </div>
                       <p className="text-[11px] text-orange-800/60 font-medium leading-relaxed">Order #{o.id.slice(0, 6)} needs shipping to {o.is_accra ? "Accra" : "Regional Area"}</p>
                    </div>
                  ))}
                  {orders.filter(o => o.status === "Processing").length === 0 && (
                    <div className="text-center py-20 text-slate-300 font-black uppercase text-[10px] tracking-widest">Everything is shipped</div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="max-w-2xl space-y-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="p-10 bg-slate-950 text-white flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl uppercase tracking-tighter">Store <span className="text-blue-500 italic">Settings</span></CardTitle>
                    <CardDescription className="text-white/40 text-[11px] font-black uppercase tracking-widest mt-1">General marketplace options</CardDescription>
                  </div>
                  <div className="p-3 bg-blue-600 rounded-2xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <Smartphone className="w-5 h-5 text-blue-600" />
                         <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">MoMo Payment Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Name</label>
                           <Input 
                             value={momoName} 
                             onChange={(e) => setMomoName(e.target.value)} 
                             className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">MoMo Number</label>
                           <Input 
                             value={momoNumber} 
                             onChange={(e) => setMomoNumber(e.target.value)} 
                             className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" 
                           />
                        </div>
                      </div>

                      <Button 
                        onClick={handleSaveSettings} 
                        disabled={isSavingSettings}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/20 text-lg uppercase tracking-[0.15em] transition-all gap-3"
                      >
                        {isSavingSettings ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {isSavingSettings ? "Saving..." : "Save Store Settings"}
                      </Button>
                   </div>

                   <div className="pt-8 border-t border-slate-100 space-y-4">
                      <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-emerald-500" /> Admin Settings Secured
                      </p>
                   </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
