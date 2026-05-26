"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { sendSms } from "@/lib/sms";
import { 
  Loader2, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  ArrowLeft,
  Banknote,
  ShieldCheck,
  ImageIcon,
  MessageSquareQuote,
  PencilLine,
  Package,
  Hash
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Western North", "Volta", "Oti", "Northern", "North East", "Savannah", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo"
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [region, setRegion] = useState("");
  const [area, setArea] = useState("");
  const [community, setCommunity] = useState("");
  const [momoSenderName, setMomoSenderName] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [momoName, setMomoName] = useState("Kanisatu Fouseni");
  const [momoNumber, setMomoNumber] = useState("0243708691");

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) { router.push("/auth"); return; }
      setSession(currentSession);

      try {
        const [profileRes, settingsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", currentSession.user.id).maybeSingle(),
          supabase.from("settings").select("*").eq("key", 'momo_payment_details').maybeSingle()
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
          if (!profileRes.data.location || !profileRes.data.contact) {
            toast({ variant: "destructive", title: "Information Needed", description: "Please add your phone and address first." });
            router.push("/profile"); return;
          }
          const locationString = profileRes.data.location || "";
          const parts = locationString.split(',').map((s: string) => s.trim());
          setCommunity(parts[0] || "");
          setArea(parts[1] || "");
          const foundRegion = GHANA_REGIONS.find(r => locationString.toLowerCase().includes(r.toLowerCase()));
          setRegion(foundRegion || (locationString.toLowerCase().includes("accra") ? "Greater Accra" : ""));
        }

        if (settingsRes.data && settingsRes.data.value) {
          setMomoName(settingsRes.data.value.name || "Kanisatu Fouseni");
          setMomoNumber(settingsRes.data.value.number || "0243708691");
        }
      } catch (err) {
        console.error("Order Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [router, toast]);

  const isAccra = region.toLowerCase() === "greater accra";
  const paymentType = isAccra ? "POD" : "Prepayment";
  const grandTotal = total;
  const isPaymentInfoMissing = !isAccra && (!selectedFile || !momoSenderName.trim());
  const isAddressIncomplete = !region || !area || !community;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handlePlaceOrder = async () => {
    if (isAddressIncomplete) { toast({ variant: "destructive", title: "Address Needed" }); return; }
    if (paymentType === "Prepayment" && (!selectedFile || !momoSenderName.trim())) { toast({ variant: "destructive", title: "Payment Info Needed" }); return; }
    setIsSubmitting(true);
    let screenshotUrl = "";
    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
        screenshotUrl = publicUrl;
      }
      const { error: orderError } = await supabase.from("orders").insert([{
        user_id: session.user.id, customer_name: profile?.full_name || session.user.email?.split('@')[0], customer_email: session.user.email,
        total_amount: grandTotal, status: "Pending", payment_type: paymentType, momo_sender_name: momoSenderName || null,
        payment_screenshot_url: screenshotUrl || null, is_accra: isAccra, extra_notes: extraNotes,
        shipping_region: region, shipping_area: area, shipping_community: community,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url }))
      }]);
      if (orderError) throw orderError;
      
      const mainItem = items[0]?.name || "Item";
      const amountFormatted = `GHS ${Number(grandTotal).toLocaleString()}`;
      const customerName = profile?.full_name || "Customer";

      const envNumbers = process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBERS || "0597204494,0256985825";
      const adminNumbers = envNumbers.split(',').map(n => n.trim());
      
      for (const num of adminNumbers) {
        if (num) {
          await sendSms(num, `New order from ${customerName}. Item: ${mainItem}. Total: ${amountFormatted}.`);
        }
      }
      
      if (profile?.contact) {
        await sendSms(profile.contact, `Hi ${customerName}, your order for ${mainItem} (${amountFormatted}) has been received and is being checked. Thank you for choosing ZiCash!`);
      }

      clearCart();
      toast({ title: "Order Placed", description: "We have received your order!" });
      router.push("/orders");
    } catch (err: any) { toast({ variant: "destructive", title: "Order Failed", description: err.message }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-screen tech-grid">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12 pb-24 md:pb-12 text-slate-900">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
             <Link href="/cart"><Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary"><ArrowLeft /></Button></Link>
             <h1 className="text-3xl md:text-5xl font-bold font-headline">Finish Your <span className="text-primary italic">Order</span></h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              {isLoading ? (
                <>
                  <Skeleton className="h-64 w-full rounded-[2rem]" />
                  <Skeleton className="h-48 w-full rounded-[2rem]" />
                </>
              ) : (
                <>
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-500">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-sm font-black uppercase tracking-[0.15em] flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                             <Select value={region} onValueChange={setRegion}>
                               <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-primary/20">
                                 <SelectValue placeholder="Select Region" />
                               </SelectTrigger>
                               <SelectContent className="rounded-2xl border-none shadow-2xl bg-slate-950 text-white overflow-hidden p-1">
                                 {GHANA_REGIONS.map(r => (
                                   <SelectItem 
                                     key={r} 
                                     value={r} 
                                     className="font-bold py-3 px-4 focus:bg-primary focus:text-white transition-colors"
                                   >
                                     {r}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area</label>
                             <Input placeholder="e.g., East Legon" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={area} onChange={(e) => setArea(e.target.value)} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address / Landmark</label>
                             <Input placeholder="Specific address or landmark" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={community} onChange={(e) => setCommunity(e.target.value)} />
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-500 delay-75">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-sm font-black uppercase tracking-[0.15em] flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      {isAccra ? (
                        <div className="flex items-center gap-6 p-8 bg-emerald-50 text-emerald-700 rounded-[2rem] border border-emerald-100/50">
                          <div className="p-4 bg-emerald-100/50 rounded-2xl"><Banknote className="w-8 h-8" /></div>
                          <div>
                            <p className="font-black uppercase tracking-tight text-lg">Pay on Delivery</p>
                            <p className="text-xs font-medium opacity-70 mt-1 uppercase tracking-widest">Available in Greater Accra.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-8 bg-blue-50 text-blue-900 rounded-[2rem] border border-blue-100 flex items-center gap-6">
                            <div className="p-4 bg-blue-100/50 rounded-2xl"><Smartphone className="w-8 h-8" /></div>
                            <div>
                               <p className="font-black uppercase tracking-tight text-lg">MoMo Prepayment Required</p>
                               <p className="text-sm font-bold mt-1 text-blue-600">{momoName}: {momoNumber}</p>
                               <p className="text-[10px] font-black uppercase opacity-40 mt-1">Required for regional delivery.</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Momo Name (Required)</label>
                               <Input 
                                 placeholder="Enter the name on your MoMo account" 
                                 className="h-14 rounded-2xl bg-white border-2 border-blue-600 font-black text-blue-900 shadow-xl shadow-blue-500/5 focus-visible:ring-blue-600/30 text-lg placeholder:text-slate-300" 
                                 value={momoSenderName} 
                                 onChange={(e) => setMomoSenderName(e.target.value)} 
                               />
                             </div>
                             
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Receipt</label>
                               <div onClick={() => document.getElementById('payment-upload')?.click()} className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group">
                                 <input type="file" id="payment-upload" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                 {previewUrl ? (
                                   <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl">
                                     <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                   </div>
                                 ) : (
                                   <>
                                     <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform"><ImageIcon className="w-8 h-8 text-slate-300" /></div>
                                     <p className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Receipt Screenshot</p>
                                   </>
                                 )}
                               </div>
                             </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="lg:col-span-5 space-y-8">
               <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden sticky top-24">
                  <div className="p-8 bg-slate-950 text-white flex items-center justify-between">
                    <h3 className="text-base font-black uppercase tracking-widest italic">Order <span className="text-blue-500">Summary</span></h3>
                    <Badge className="bg-blue-600 border-none text-[8px] font-black uppercase">{items.length} Items</Badge>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 group">
                          <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            <Image src={item.image_url} alt={item.name} width={40} height={40} className="object-contain p-1" />
                            <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border border-white">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-900 truncate leading-tight uppercase group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price: GH₵{item.price.toLocaleString()}</p>
                          </div>
                          <p className="text-xs font-black text-slate-900 italic tracking-tighter shrink-0">
                             GH₵{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50">
                       <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>Subtotal</span>
                          <span className="text-slate-900 font-black italic">GH₵{total.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>Delivery</span>
                          <span className="text-emerald-600 font-black uppercase text-[10px]">Free Shipping</span>
                       </div>
                       <div className="pt-6 flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Cost</span>
                          <span className="text-4xl font-black text-primary font-headline italic tracking-tighter">GHS {total.toLocaleString()}</span>
                       </div>
                    </div>

                    <Button 
                      className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 text-lg uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || (paymentType === "Prepayment" && isPaymentInfoMissing) || isAddressIncomplete || isLoading}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin mr-3 w-6 h-6" /> : <CheckCircle2 className="mr-3 w-6 h-6" />} Place Order
                    </Button>

                    <p className="text-[8px] text-center text-slate-400 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Secure Ordering System
                    </p>
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
