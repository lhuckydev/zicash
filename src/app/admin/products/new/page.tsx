"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Banknote, 
  Image as ImageIcon, 
  Loader2, 
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  Cpu,
  Monitor,
  Database,
  Smartphone,
  CheckCircle2,
  Zap,
  Info,
  X,
  Plus,
  Trash2,
  Settings2,
  Layers,
  ChevronRight,
  ShieldCheck,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SESSION_TIMEOUT = 7200000;

interface ProductVariantForm {
  id?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  screen?: string;
  touchscreen?: boolean;
  condition?: string;
  chipset?: string;
  color?: string;
  battery?: string;
  network?: string;
  price: number;
  stock: number;
}

export default function NewProductWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    brand: "",
    category: "Laptops",
    description: "",
    featured: false,
    warranty: "1 Year ZiCash Warranty",
    stock_status: "In Stock"
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Step 2: Variants
  const [variants, setVariants] = useState<ProductVariantForm[]>([
    { price: 0, stock: 10, condition: "New", touchscreen: false }
  ]);

  // Step 3: Advanced Optional Specs
  const [advancedSpecs, setAdvancedSpecs] = useState<Record<string, string>>({});

  const isSimpleCategory = ["Accessories", "Educational Consult"].includes(basicInfo.category);
  const isConsult = basicInfo.category === "Educational Consult";

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_session') === 'true';
    const lastActivity = parseInt(localStorage.getItem('admin_last_activity') || '0');
    const now = Date.now();
    if (isAuth && (now - lastActivity < SESSION_TIMEOUT)) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "zicashadmin") {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setIsAuthenticated(true);
    } else {
      toast({ variant: "destructive", title: "Denied", description: "Incorrect password." });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { price: 0, stock: 10, condition: "New", touchscreen: false }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariantForm, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const generateLabel = (v: ProductVariantForm) => {
    if (isSimpleCategory) return "Standard Unit";
    if (basicInfo.category === "Laptops") {
      return `${v.cpu || 'Base'} / ${v.ram || '8GB'} / ${v.storage || '256GB'}${v.gpu ? ` / ${v.gpu}` : ''}`;
    } else if (basicInfo.category === "Phones") {
      return `${v.ram || '8GB'} / ${v.storage || '128GB'} / ${v.color || 'Onyx'}`;
    }
    return "Standard Configuration";
  };

  const handleFinalSave = async () => {
    if (!basicInfo.name || variants.some(v => !v.price)) {
      toast({ variant: "destructive", title: "Wait", description: "Product Name and all Variant Prices are required." });
      return;
    }

    setIsSaving(true);
    let finalImageUrls: string[] = [];

    try {
      setIsUploading(true);
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
        finalImageUrls.push(publicUrl);
      }
      setIsUploading(false);

      // 1. Insert Product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          ...basicInfo,
          image_url: finalImageUrls[0] || "",
          image_urls: finalImageUrls,
          price: Math.min(...variants.map(v => v.price)), // "Starting at" price
          advanced_specs: isSimpleCategory ? {} : advancedSpecs,
          specs: isSimpleCategory ? "Standard Item" : generateLabel(variants[0])
        }])
        .select()
        .single();

      if (productError) throw productError;

      // 2. Insert Variants
      const variantsToInsert = (isSimpleCategory ? [variants[0]] : variants).map((v, idx) => ({
        ...v,
        product_id: productData.id,
        label: isSimpleCategory ? "Standard Unit" : generateLabel(v),
        is_default: idx === 0
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);

      if (variantError) throw variantError;

      toast({ title: "Inventory Synchronized", description: "Product has been successfully archived." });
      router.push("/admin");
    } catch (err: any) {
      console.error("Save Error:", err);
      toast({ variant: "destructive", title: "Wizard Failure", description: err.message });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
           <div className="bg-slate-900 p-10 text-center">
               <h1 className="text-white font-black text-2xl uppercase">Admin <span className="text-blue-500 italic">Auth</span></h1>
           </div>
           <CardContent className="p-10">
             <form onSubmit={handleAuth} className="space-y-6">
               <Input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-black" />
               <Button className="w-full h-14 bg-blue-600 font-black rounded-2xl text-white uppercase tracking-widest">Login</Button>
             </form>
           </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 tech-grid pb-24 md:pb-12 font-body">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" className="gap-2 font-black text-slate-500 hover:text-blue-600 uppercase text-[10px] tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Cancel Upload
            </Button>
          </Link>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", step >= i ? "bg-blue-600 w-8" : "bg-slate-200")} />
                ))}
             </div>
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Step {step} of 3</p>
                <h1 className="text-xl font-black text-slate-900 mt-1 uppercase italic">Product <span className="text-blue-600">Wizard</span></h1>
             </div>
          </div>
        </div>

        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-blue-700 ml-1">Department Selection</label>
                        <Select value={basicInfo.category} onValueChange={(val) => setBasicInfo({...basicInfo, category: val})}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="Laptops" className="font-black">Laptops</SelectItem>
                            <SelectItem value="Phones" className="font-black">Phones</SelectItem>
                            <SelectItem value="Accessories" className="font-black">Accessories</SelectItem>
                            <SelectItem value="Educational Consult" className="font-black">Educational Consult</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4 space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Inventory Media</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer group hover:border-blue-600 transition-all mb-4"
                        >
                          <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-blue-600 transition-colors" />
                          <p className="text-[9px] font-black uppercase text-slate-400">Pick Images</p>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {previewUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group/img shadow-sm">
                              <Image src={url} alt="Preview" fill className="object-cover" />
                              <button onClick={() => { setPreviewUrls(p => p.filter((_, i) => i !== idx)); setSelectedFiles(f => f.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </Card>
             </div>

             <div className="lg:col-span-8 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                   <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Identity <span className="text-blue-500 italic">& Purpose</span></h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Foundational Unit Details</p>
                      </div>
                      {isConsult ? <GraduationCap className="w-10 h-10 text-blue-500 opacity-50" /> : <Box className="w-10 h-10 text-blue-500 opacity-50" />}
                   </div>
                   <CardContent className="p-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Item Title</label>
                          <Input placeholder="e.g., Undergraduate Admission Support" className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xl shadow-inner" value={basicInfo.name} onChange={e => setBasicInfo({...basicInfo, name: e.target.value})} />
                        </div>
                        {!isConsult && (
                          <>
                            <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Brand</label>
                              <Input placeholder="Apple / Logitech" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={basicInfo.brand} onChange={e => setBasicInfo({...basicInfo, brand: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Warranty Period</label>
                              <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={basicInfo.warranty} onChange={e => setBasicInfo({...basicInfo, warranty: e.target.value})} />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                         <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Description Payload</label>
                         <Textarea placeholder="Professional marketing copy for the item..." className="rounded-[2rem] bg-slate-50 border-none min-h-[160px] font-medium text-lg leading-relaxed shadow-inner" value={basicInfo.description} onChange={e => setBasicInfo({...basicInfo, description: e.target.value})} />
                      </div>

                      <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 shadow-sm">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><Zap className="w-6 h-6" /></div>
                            <div>
                               <p className="font-black text-slate-900 uppercase text-xs">Featured Selection</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Display on landing page highlights</p>
                            </div>
                         </div>
                         <Switch checked={basicInfo.featured} onCheckedChange={(val) => setBasicInfo({...basicInfo, featured: val})} className="data-[state=checked]:bg-blue-600" />
                      </div>

                      <Button onClick={() => setStep(2)} className="w-full h-16 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl text-white uppercase tracking-widest text-lg shadow-xl shadow-blue-600/20 gap-3">
                         Continue to Pricing <ArrowRight className="w-6 h-6" />
                      </Button>
                   </CardContent>
                </Card>
             </div>
          </div>
        )}

        {/* STEP 2: PRICING & INVENTORY */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 italic">{isSimpleCategory ? "Inventory Node" : "Variant Forge"}</h2>
                   <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">{isSimpleCategory ? "Set unit valuation and availability" : "Configure hardware nodes and pricing nodes"}</p>
                </div>
                {!isSimpleCategory && (
                  <Button onClick={addVariant} className="h-14 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] px-8 shadow-sm gap-2">
                     <Plus className="w-4 h-4" /> Add Configuration
                  </Button>
                )}
             </div>

             <div className="grid grid-cols-1 gap-8">
                {(isSimpleCategory ? [variants[0]] : variants).map((v, idx) => (
                  <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                     <div className="p-6 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">#0{idx + 1}</div>
                           <h3 className="font-black text-slate-900 uppercase italic tracking-tight">{isSimpleCategory ? "Standard Item Pricing" : generateLabel(v)}</h3>
                        </div>
                        {!isSimpleCategory && variants.length > 1 && (
                          <Button variant="ghost" onClick={() => removeVariant(idx)} className="h-10 w-10 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-5 h-5" /></Button>
                        )}
                     </div>
                     <CardContent className="p-10">
                        {!isSimpleCategory && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            {basicInfo.category === "Laptops" ? (
                              <>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPU Model</label><Input placeholder="Core i7 13th Gen" className="h-12 bg-slate-50 border-none font-bold" value={v.cpu || ""} onChange={e => updateVariant(idx, 'cpu', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM Size</label><Input placeholder="16GB" className="h-12 bg-slate-50 border-none font-bold" value={v.ram || ""} onChange={e => updateVariant(idx, 'ram', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</label><Input placeholder="512GB SSD" className="h-12 bg-slate-50 border-none font-bold" value={v.storage || ""} onChange={e => updateVariant(idx, 'storage', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPU</label><Input placeholder="RTX 4060 (Opt)" className="h-12 bg-slate-50 border-none font-bold" value={v.gpu || ""} onChange={e => updateVariant(idx, 'gpu', e.target.value)} /></div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM</label><Input placeholder="8GB" className="h-12 bg-slate-50 border-none font-bold" value={v.ram || ""} onChange={e => updateVariant(idx, 'ram', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</label><Input placeholder="128GB" className="h-12 bg-slate-50 border-none font-bold" value={v.storage || ""} onChange={e => updateVariant(idx, 'storage', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label><Input placeholder="Titanium Blue" className="h-12 bg-slate-50 border-none font-bold" value={v.color || ""} onChange={e => updateVariant(idx, 'color', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chipset</label><Input placeholder="A17 Bionic" className="h-12 bg-slate-50 border-none font-bold" value={v.chipset || ""} onChange={e => updateVariant(idx, 'chipset', e.target.value)} /></div>
                              </>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
                           <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Standard Price (GH₵)</label>
                             <div className="relative">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600">GH₵</div>
                               <Input type="number" className="pl-14 h-14 bg-blue-50 border-none font-black text-2xl text-blue-900" value={v.price} onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value))} />
                             </div>
                           </div>
                           <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units Available</label><Input type="number" className="h-14 bg-slate-50 border-none font-black text-lg" value={v.stock} onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value))} /></div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</label>
                             <Select value={v.condition} onValueChange={val => updateVariant(idx, 'condition', val)}>
                               <SelectTrigger className="h-14 bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                               <SelectContent className="rounded-xl border-none"><SelectItem value="New" className="font-bold">New</SelectItem><SelectItem value="Used - Grade A" className="font-bold">Grade A</SelectItem><SelectItem value="Used - Grade B" className="font-bold">Grade B</SelectItem></SelectContent>
                             </Select>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                ))}
             </div>

             <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 px-10 rounded-2xl font-black uppercase text-[12px] tracking-widest border border-slate-100 bg-white">Back to Step 1</Button>
                <Button onClick={() => isSimpleCategory ? handleFinalSave() : setStep(3)} className="flex-1 h-16 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl text-white uppercase tracking-widest text-lg shadow-xl shadow-blue-600/20 gap-3">
                   {isSimpleCategory ? (isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : "Archive Unit Now") : "Continue to Advanced Details"} <ArrowRight className="w-6 h-6" />
                </Button>
             </div>
          </div>
        )}

        {/* STEP 3: ADVANCED SPECS */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="lg:col-span-8 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                   <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight italic">Technical <span className="text-blue-500">Payload</span></h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Optional System Specifications</p>
                      </div>
                      <Settings2 className="w-10 h-10 text-blue-500 opacity-50" />
                   </div>
                   <CardContent className="p-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {basicInfo.category === "Laptops" ? (
                           <>
                             {[
                               { id: 'res', label: 'Display Resolution', placeholder: '2560 x 1600' },
                               { id: 'ports', label: 'I/O Ports', placeholder: '3x TB4, HDMI 2.1' },
                               { id: 'battery', label: 'Battery Capacity', placeholder: '70Wh Li-Po' },
                               { id: 'os', label: 'OS Pre-installed', placeholder: 'Windows 11 Pro' },
                               { id: 'kb', label: 'Keyboard Type', placeholder: 'Backlit English' },
                               { id: 'audio', label: 'Audio System', placeholder: 'Harman Kardon Dual' }
                             ].map(f => (
                               <div key={f.id} className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                                  <Input placeholder={f.placeholder} className="h-12 bg-slate-50 border-none font-medium" value={advancedSpecs[f.id] || ""} onChange={e => setAdvancedSpecs({...advancedSpecs, [f.id]: e.target.value})} />
                               </div>
                             ))}
                           </>
                         ) : (
                           <>
                             {[
                               { id: 'camera', label: 'Camera Array', placeholder: '50MP Triple Node' },
                               { id: 'refresh', label: 'Refresh Rate', placeholder: '120Hz LTPO' },
                               { id: 'charge', label: 'Charging Speed', placeholder: '67W Fast Link' },
                               { id: 'rating', label: 'Waterproof Rating', placeholder: 'IP68' },
                               { id: 'biometrics', label: 'Security', placeholder: 'FaceID / In-screen' }
                             ].map(f => (
                               <div key={f.id} className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                                  <Input placeholder={f.placeholder} className="h-12 bg-slate-50 border-none font-medium" value={advancedSpecs[f.id] || ""} onChange={e => setAdvancedSpecs({...advancedSpecs, [f.id]: e.target.value})} />
                               </div>
                             ))}
                           </>
                         )}
                      </div>

                      <div className="pt-8 border-t border-slate-50 flex gap-4">
                        <Button variant="ghost" onClick={() => setStep(2)} className="h-16 px-10 rounded-2xl font-black uppercase text-[12px] tracking-widest border border-slate-100 bg-white">Back to Variants</Button>
                        <Button onClick={handleFinalSave} disabled={isSaving} className="flex-1 h-16 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl text-white uppercase tracking-widest text-lg shadow-xl shadow-blue-600/20 gap-3">
                           {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />} Archive Product & Variants
                        </Button>
                      </div>
                   </CardContent>
                </Card>
             </div>

             <div className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
                   <h3 className="text-sm font-black uppercase tracking-widest mb-6 italic text-slate-400">Final Verification</h3>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                         <span className="text-xs font-bold text-slate-600">{basicInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                         <span className="text-xs font-bold text-slate-600">{variants.length} Configurations Loaded</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                         <span className="text-xs font-bold text-slate-600">Starting Price: GHS {Math.min(...variants.map(v => v.price)).toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                      <Layers className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Professional Tier Inventory Management System Active</p>
                   </div>
                </Card>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
