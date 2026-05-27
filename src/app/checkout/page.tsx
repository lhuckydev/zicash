
"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Navigation,
  Target
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const [paymentChoice, setPaymentChoice] = useState<"POD" | "Prepayment">("Prepayment");
  
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
          supabase.from("settings").select("*").eq('key', 'momo_payment_details').maybeSingle()
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
          if (!profileRes.data.location || !profileRes.data.contact) {
            toast({ variant: "destructive", title: "Information Missing", description: "Please add your phone and address to your profile first." });
            router.push("/profile"); return;
          }
          const locationString = profileRes.data.location || "";
          const parts = locationString.split(',').map((s: string) => s.trim());
          setCommunity(parts[0] || "");
          setArea(parts[1] || "");
          const foundRegion = GHANA_REGIONS.find(r => locationString.toLowerCase().includes(r.toLowerCase()));
          const initialRegion = foundRegion || (locationString.toLowerCase().includes("accra") ? "Greater Accra" : "");
          setRegion(initialRegion);
          
          if (initialRegion === "Greater Accra") {
            setPaymentChoice("POD");
          } else {
            setPaymentChoice("Prepayment");
          }
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
  
  useEffect(() => {
    if (!isAccra && region !== "") {
      setPaymentChoice("Prepayment");
    }
  }, [region, isAccra]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported", description: "Your phone doesn't support location features." });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'ZiCash-App' } }
          );
          
          const data = await response.json();
          const readableAddress = data.display_name || "Location found";
          
          setCommunity(readableAddress);
          
          toast({ title: "Address Found", description: "We've updated your landmark with your current location." });
        } catch (err) {
          console.error("Geocoding error:", err);
          toast({ title: "Location Saved", description: "Exact coordinates saved, but we couldn't get a readable address." });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast({ variant: "destructive", title: "Error", description: "Could not find your location. Please check your phone settings." });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handlePlaceOrder = async () => {
    if (!region || !area || !community) { toast({ variant: "destructive", title: "Address Required" }); return; }
    if (paymentChoice === "Prepayment" && (!selectedFile || !momoSenderName.trim())) { 
      toast({ variant: "destructive", title: "Payment Photo Required", description: "Please upload your payment photo and enter your account name." }); 
      return; 
    }
    
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
        user_id: session.user.id, 
        customer_name: profile?.full_name || session.user.email?.split('@')[0], 
        customer_email: session.user.email,
        total_amount: total, 
        status: "Pending", 
        payment_type: paymentChoice, 
        momo_sender_name: momoSenderName || null,
        payment_screenshot_url: screenshotUrl || null, 
        is_accra: isAccra, 
        extra_notes: extraNotes,
        shipping_region: region, 
        shipping_area: area, 
        shipping_community: community,
        latitude: coords?.lat || null,
        longitude: coords?.lon || null,
        items: items.map(i => {
           const unitOriginalPrice = i.selectedVariant ? i.selectedVariant.price : i.price;
           const unitDiscountPrice = i.selectedVariant ? i.selectedVariant.discount_price : i.discount_price;
           const finalUnitPrice = (unitDiscountPrice && unitDiscountPrice > 0) ? unitDiscountPrice : unitOriginalPrice;
           
           return { 
             id: i.id, 
             name: i.name, 
             price: finalUnitPrice, 
             quantity: i.quantity, 
             image_url: i.image_url,
             variant_label: i.selectedVariant?.label,
             variant_id: i.selectedVariant?.id
           };
        })
      }]);
      
      if (orderError) throw orderError;
      
      const mainItem = items[0]?.name || "Product";
      const customerName = profile?.full_name || "Customer";
      const admin1 = "0597204494";
      const adminMessage = `New order from ${customerName}. Item: ${mainItem}. Total: GHS ${total.toLocaleString()}. Check ZiCash Manager.`;
      
      await sendSms(admin1, adminMessage);
      if (profile?.contact) {
        await sendSms(profile.contact, `Hi ${customerName}, your order for ${mainItem} has been received. We are checking it now. Thank you!`);
      }

      clearCart();
      toast({ title: "Order Placed", description: "Success! We have received your order details." });
      router.push("/orders");
    } catch (err: any) { 
      toast({ variant: "destructive", title: "Error", description: err.message }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-body bg-[#FBFBFE] text-slate-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 pb-24 md:pb-12 text-slate-900">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
             <Link href="/cart"><Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-blue-600"><ArrowLeft /></Button></Link>
             <h1 className="text-3xl md:text-5xl font-black font-headline uppercase italic">Order <span className="text-blue-600">Details</span></h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-7 space-y-8">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full rounded-[3rem]" />
                  <Skeleton className="h-48 w-full rounded-[3rem]" />
                </div>
              ) : (
                <>
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden animate-in fade-in">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-blue-600">
                        <MapPin className="w-4 h-4" /> Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                             <Select value={region} onValueChange={setRegion}>
                               <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900">
                                 <SelectValue placeholder="Select Region" />
                               </SelectTrigger>
                               <SelectContent className="rounded-xl border-none shadow-2xl bg-white p-1">
                                 {GHANA_REGIONS.map(r => (
                                   <SelectItem key={r} value={r} className="font-bold py-2 px-4">{r}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area / Town</label>
                             <Input placeholder="e.g., East Legon" className="h-12 rounded-xl bg-slate-50 border-none font-bold" value={area} onChange={(e) => setArea(e.target.value)} />
                          </div>
                          <div className="space-y-4 md:col-span-2">
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">House Number / Landmark</label>
                               <Input placeholder="e.g. Blue building near the station" className="h-12 rounded-xl bg-slate-50 border-none font-bold" value={community} onChange={(e) => setCommunity(e.target.value)} />
                             </div>
                             
                             <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleGetLocation} 
                              disabled={isLocating}
                              className={cn(
                                "w-full h-12 rounded-xl border-blue-100 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-sm transition-all",
                                coords ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 hover:bg-blue-50"
                              )}
                             >
                               {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : (coords ? <CheckCircle2 className="w-4 h-4" /> : <Navigation className="w-4 h-4" />)}
                               {isLocating ? "Finding your spot..." : (coords ? "Location Updated in Form" : "Use My Current Location for Delivery")}
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-blue-600">
                        <MessageSquareQuote className="w-4 h-4" /> Special Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                       <Textarea 
                        placeholder="Any extra details? (e.g. gate color, preferred time...)" 
                        className="min-h-[120px] rounded-2xl bg-slate-50 border-none font-bold p-6 shadow-inner"
                        value={extraNotes}
                        onChange={(e) => setExtraNotes(e.target.value)}
                       />
                    </CardContent>
                  </Card>

                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-blue-600">
                        <CreditCard className="w-4 h-4" /> Payment Choice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                      {isAccra ? (
                        <div className="space-y-6">
                           <RadioGroup value={paymentChoice} onValueChange={(val: any) => setPaymentChoice(val)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Label
                                htmlFor="pod"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-2xl border-2 p-6 cursor-pointer hover:bg-slate-50 transition-all",
                                  paymentChoice === "POD" ? "border-blue-600 bg-blue-50/50" : "border-slate-100"
                                )}
                              >
                                <RadioGroupItem value="POD" id="pod" className="sr-only" />
                                <Banknote className="mb-3 h-6 w-6 text-blue-600" />
                                <span className="text-sm font-black uppercase italic tracking-tight">Pay on Delivery</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Pay at your door</span>
                              </Label>
                              <Label
                                htmlFor="pre"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-2xl border-2 p-6 cursor-pointer hover:bg-slate-50 transition-all",
                                  paymentChoice === "Prepayment" ? "border-blue-600 bg-blue-50/50" : "border-slate-100"
                                )}
                              >
                                <RadioGroupItem value="Prepayment" id="pre" className="sr-only" />
                                <Smartphone className="mb-3 h-6 w-6 text-blue-600" />
                                <span className="text-sm font-black uppercase italic tracking-tight">Pay Before Delivery</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Mobile Money Transfer</span>
                              </Label>
                           </RadioGroup>
                        </div>
                      ) : (
                        <div className="p-8 bg-blue-50 text-blue-900 rounded-3xl border border-blue-100 flex items-center gap-6">
                          <div className="p-4 bg-white rounded-2xl shadow-sm"><Smartphone className="w-8 h-8 text-blue-600" /></div>
                          <div>
                             <p className="font-black uppercase tracking-tight text-lg italic">Payment Before Delivery</p>
                             <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Required for orders outside Accra.</p>
                          </div>
                        </div>
                      )}

                      {paymentChoice === "Prepayment" && (
                        <div className="space-y-8 p-8 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-2">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Send Payment To:</p>
                                <p className="text-lg font-black text-blue-600 mt-1">{momoName}</p>
                                <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{momoNumber}</p>
                             </div>
                             <div className="p-4 bg-white rounded-2xl border border-slate-200 self-start max-w-[150px]">
                                <p className="text-[9px] font-bold text-slate-500 text-center leading-tight">
                                  Transactions will be verified as soon as they are received.
                                </p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Mobile Money Name</label>
                               <Input placeholder="Name on your account" className="h-12 rounded-xl bg-white border-slate-200 font-bold" value={momoSenderName} onChange={(e) => setMomoSenderName(e.target.value)} />
                             </div>
                             
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Photo (Receipt)</label>
                               <div onClick={() => document.getElementById('receipt-upload')?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-all group">
                                 <input type="file" id="receipt-upload" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                 {previewUrl ? (
                                   <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg"><Image src={previewUrl} alt="Receipt" fill className="object-cover" /></div>
                                 ) : (
                                   <>
                                     <ImageIcon className="w-8 h-8 text-slate-300 mb-2 group-hover:text-blue-600 transition-colors" />
                                     <p className="text-[10px] font-black uppercase text-slate-400">Add Photo</p>
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
               <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden sticky top-24">
                  <div className="p-10 space-y-8">
                    <h3 className="text-xl font-black uppercase italic text-blue-500">Your Basket</h3>
                    
                    <div className="space-y-6 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                      {items.map((item, idx) => {
                        const originalPrice = item.selectedVariant ? item.selectedVariant.price : item.price;
                        const discountPrice = item.selectedVariant ? item.selectedVariant.discount_price : item.discount_price;
                        const finalPrice = (discountPrice && discountPrice > 0) ? discountPrice : originalPrice;
                        return (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 flex items-center justify-center">
                              <Image src={item.image_url} alt={item.name} width={40} height={40} className="object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate uppercase">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">{item.quantity} × GH₵ {finalPrice.toLocaleString()}</p>
                            </div>
                            <p className="text-sm font-black italic">GH₵ {(finalPrice * item.quantity).toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>Delivery</span>
                          <span className="text-emerald-500 italic">FREE</span>
                       </div>
                       <div className="pt-4 flex justify-between items-end">
                          <span className="text-xs font-black uppercase text-slate-400">Total to Pay</span>
                          <span className="text-4xl font-black text-blue-500 italic tracking-tighter">GHS {total.toLocaleString()}</span>
                       </div>
                    </div>

                    <Button 
                      className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 text-lg uppercase tracking-widest transition-all hover:scale-[1.02]"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin mr-3 w-6 h-6" /> : <Target className="mr-3 w-6 h-6" />} Finish Order
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-slate-500">
                       <ShieldCheck className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
                    </div>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
