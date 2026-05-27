
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Box, 
  Banknote, 
  Image as ImageIcon, 
  Loader2, 
  ArrowLeft,
  Save,
  Upload,
  Monitor,
  Smartphone,
  GraduationCap,
  Zap,
  Info,
  X,
  Tag,
  Fingerprint,
  Keyboard,
  MousePointer2,
  Cpu,
  Database,
  Layers,
  Settings2,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Product, ProductVariant } from "@/store/useCartStore";
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
  keyboard_light?: boolean;
  fingerprint?: boolean;
  condition?: string;
  chipset?: string;
  color?: string;
  battery?: string;
  network?: string;
  price: string; // Use string for smooth typing
  stock: string; // Use string for smooth typing
  label: string;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    brand: "",
    category: "Laptops",
    description: "",
    featured: false,
    warranty: "1 Year ZiCash Warranty",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariantForm[]>([]);
  const [advancedSpecs, setAdvancedSpecs] = useState<Record<string, string>>({});

  const isSimpleCategory = ["Accessories", "Educational Consult"].includes(basicInfo.category);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_session') === 'true';
    const lastActivity = parseInt(localStorage.getItem('admin_last_activity') || '0');
    const now = Date.now();
    if (isAuth && (now - lastActivity < SESSION_TIMEOUT)) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_last_activity', now.toString());
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  async function fetchProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setBasicInfo({
        name: data.name || "",
        brand: data.brand || "",
        category: data.category || "Laptops",
        description: data.description || "",
        featured: data.featured || false,
        warranty: data.warranty || "1 Year ZiCash Warranty",
      });

      setExistingImages(data.image_urls || [data.image_url]);
      setAdvancedSpecs(data.advanced_specs || {});

      if (data.variants) {
        setVariants(data.variants.map((v: any) => ({
          ...v,
          price: v.price.toString(),
          stock: v.stock.toString()
        })));
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Error", description: err.message });
      router.push("/admin");
    } finally {
      setIsLoading(false);
    }
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "zicashadmin") {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setIsAuthenticated(true);
      fetchProduct();
    } else {
      toast({ variant: "destructive", title: "Denied", description: "Incorrect clearance key." });
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

  const updateVariant = (index: number, field: keyof ProductVariantForm, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = async (index: number) => {
    const variantToRemove = variants[index];
    if (variantToRemove.id) {
      if (!confirm("Are you sure you want to permanently delete this configuration?")) return;
      const { error } = await supabase.from('product_variants').delete().eq('id', variantToRemove.id);
      if (error) {
        toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
        return;
      }
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { price: "0", stock: "10", condition: "New", touchscreen: true, keyboard_light: true, fingerprint: true, label: "New Configuration" }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let finalImageUrls = [...existingImages];

    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `products/${fileName}`;
          await supabase.storage.from('products').upload(filePath, file);
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
          finalImageUrls.push(publicUrl);
        }
      }

      // 1. Update Product Table
      const minPrice = Math.min(...variants.map(v => parseFloat(v.price) || 0));
      const { error: productError } = await supabase
        .from('products')
        .update({
          ...basicInfo,
          image_url: finalImageUrls[0] || "",
          image_urls: finalImageUrls,
          price: minPrice,
          advanced_specs: advancedSpecs,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (productError) throw productError;

      // 2. Update Variants Table
      for (const v of variants) {
        const variantPayload = {
          ...v,
          product_id: id as string,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
        };

        if (v.id) {
          const { error: vError } = await supabase.from('product_variants').update(variantPayload).eq('id', v.id);
          if (vError) throw vError;
        } else {
          const { error: vError } = await supabase.from('product_variants').insert([variantPayload]);
          if (vError) throw vError;
        }
      }

      toast({ title: "Updated Successfully", description: "Changes saved to the marketplace catalog." });
      router.push("/admin");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const generateLabel = (v: ProductVariantForm) => {
    if (isSimpleCategory) return "Standard Unit";
    if (basicInfo.category === "Laptops") {
      return `${v.cpu || 'Base'} / ${v.ram || '8GB'} / ${v.storage || '256GB'}${v.gpu ? ` / ${v.gpu}` : ''}`;
    } else if (basicInfo.category === "Phones") {
      return `${v.ram || '8GB'} / ${v.storage || '128GB'} / ${v.color || 'Onyx'}`;
    }
    return v.label || "Standard Configuration";
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 opacity-20" /></div>;

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
           <div className="bg-slate-900 p-10 text-center">
               <h1 className="text-white font-black text-2xl uppercase italic">Admin <span className="text-blue-500">Editor</span></h1>
           </div>
           <CardContent className="p-10">
             <form onSubmit={handleAuth} className="space-y-6">
               <Input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-black text-center" />
               <Button className="w-full h-14 bg-blue-600 font-black rounded-2xl text-white uppercase tracking-widest shadow-xl shadow-blue-600/20">Authorize Access</Button>
             </form>
           </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-24 text-slate-900 font-body tech-grid">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" className="gap-2 font-black text-slate-500 hover:text-blue-600 uppercase text-[10px] tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Exit Editor
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">ZiCash GH</p>
            <h1 className="text-2xl font-black text-slate-900 mt-1 uppercase italic">Edit <span className="text-blue-600">Hardware</span></h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Basic Media & Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-blue-700 ml-1">Department</label>
                    <Select value={basicInfo.category} onValueChange={(val) => setBasicInfo({ ...basicInfo, category: val })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none">
                        <SelectItem value="Laptops" className="font-black">Laptops</SelectItem>
                        <SelectItem value="Phones" className="font-black">Phones</SelectItem>
                        <SelectItem value="Accessories" className="font-black">Accessories</SelectItem>
                        <SelectItem value="Educational Consult" className="font-black">Educational Consult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Hardware Gallery</label>
                    <div onClick={() => fileInputRef.current?.click()} className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition-all mb-4">
                      <Upload className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-[9px] font-black uppercase text-slate-400">Add Media</p>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.concat(previewUrls).map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                          <Image src={url} alt="Gallery" fill className="object-cover" />
                          <button onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             </Card>

             <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-6 h-6 text-blue-500" />
                     <h3 className="font-black uppercase tracking-widest text-xs italic">System Verification</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Ensure all technical details are accurate before committing changes to the live marketplace.</p>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] gap-2">
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Commit Changes
                  </Button>
               </div>
             </Card>
          </div>

          {/* Right Column: Detailed Specs */}
          <div className="lg:col-span-8 space-y-10">
             <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="p-10 bg-slate-900 text-white flex justify-between items-center">
                   <div>
                     <CardTitle className="text-2xl uppercase tracking-tighter italic font-headline">Basic <span className="text-blue-500">Information</span></CardTitle>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">General catalog labels</p>
                   </div>
                   <div className="p-4 bg-blue-600 rounded-3xl">
                     {basicInfo.category === "Laptops" && <Monitor className="w-7 h-7" />}
                     {basicInfo.category === "Phones" && <Smartphone className="w-7 h-7" />}
                     {basicInfo.category === "Educational Consult" && <GraduationCap className="w-7 h-7" />}
                   </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Hardware Title</label>
                        <Input className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xl shadow-inner italic" value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Brand</label>
                        <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={basicInfo.brand} onChange={(e) => setBasicInfo({...basicInfo, brand: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Warranty Coverage</label>
                        <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={basicInfo.warranty} onChange={(e) => setBasicInfo({...basicInfo, warranty: e.target.value})} />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 col-span-1 md:col-span-2">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><Zap className="w-6 h-6" /></div>
                            <div>
                               <p className="font-black text-slate-900 uppercase text-xs">Featured Item</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Showcase on landing page</p>
                            </div>
                         </div>
                         <Switch checked={basicInfo.featured} onCheckedChange={(val) => setBasicInfo({...basicInfo, featured: val})} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Hardware Description</label>
                      <Textarea className="rounded-[2.5rem] bg-slate-50 border-none min-h-[180px] font-medium text-lg leading-relaxed shadow-inner p-8" value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} />
                   </div>
                </CardContent>
             </Card>

             {/* Hardware Configurations Section */}
             <div className="space-y-6">
               <div className="flex items-center justify-between px-4">
                  <h2 className="text-2xl font-black uppercase italic tracking-tight font-headline">Option <span className="text-blue-600">Modules</span></h2>
                  <Button onClick={addVariant} className="h-12 px-6 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Add Configuration
                  </Button>
               </div>
               
               <div className="space-y-8">
                 {variants.map((v, idx) => (
                   <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                      <div className="p-6 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">#{idx + 1}</div>
                            <h3 className="font-black text-slate-900 uppercase italic tracking-tight">{v.id ? `Editing: ${v.label}` : 'New Configuration'}</h3>
                         </div>
                         {variants.length > 1 && (
                           <button onClick={() => removeVariant(idx)} className="h-10 w-10 flex items-center justify-center text-red-300 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                         )}
                      </div>
                      <CardContent className="p-10 space-y-10">
                        {!isSimpleCategory && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {basicInfo.category === "Laptops" ? (
                              <>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPU</label><Input placeholder="e.g. Core i7" className="h-12 bg-slate-50 border-none font-bold" value={v.cpu || ""} onChange={e => updateVariant(idx, 'cpu', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM</label><Input placeholder="e.g. 16GB" className="h-12 bg-slate-50 border-none font-bold" value={v.ram || ""} onChange={e => updateVariant(idx, 'ram', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</label><Input placeholder="e.g. 512GB" className="h-12 bg-slate-50 border-none font-bold" value={v.storage || ""} onChange={e => updateVariant(idx, 'storage', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Graphics</label><Input placeholder="Optional" className="h-12 bg-slate-50 border-none font-bold" value={v.gpu || ""} onChange={e => updateVariant(idx, 'gpu', e.target.value)} /></div>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <div className="flex items-center gap-3"><MousePointer2 className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-black uppercase text-slate-600">Touchscreen</span></div>
                                   <Switch checked={v.touchscreen} onCheckedChange={val => updateVariant(idx, 'touchscreen', val)} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <div className="flex items-center gap-3"><Keyboard className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-black uppercase text-slate-600">Backlit</span></div>
                                   <Switch checked={v.keyboard_light} onCheckedChange={val => updateVariant(idx, 'keyboard_light', val)} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 md:col-span-2">
                                   <div className="flex items-center gap-3"><Fingerprint className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-black uppercase text-slate-600">Fingerprint</span></div>
                                   <Switch checked={v.fingerprint} onCheckedChange={val => updateVariant(idx, 'fingerprint', val)} />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM</label><Input className="h-12 bg-slate-50 border-none font-bold" value={v.ram || ""} onChange={e => updateVariant(idx, 'ram', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</label><Input className="h-12 bg-slate-50 border-none font-bold" value={v.storage || ""} onChange={e => updateVariant(idx, 'storage', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label><Input className="h-12 bg-slate-50 border-none font-bold" value={v.color || ""} onChange={e => updateVariant(idx, 'color', e.target.value)} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chipset</label><Input className="h-12 bg-slate-50 border-none font-bold" value={v.chipset || ""} onChange={e => updateVariant(idx, 'chipset', e.target.value)} /></div>
                              </>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-slate-50">
                           <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Regular Price (GH₵)</label>
                             <div className="relative">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600 pointer-events-none">GH₵</div>
                               <input 
                                 type="text"
                                 inputMode="decimal"
                                 className="w-full pl-14 h-14 bg-blue-50/50 border-none rounded-2xl font-black text-2xl text-blue-900 px-4 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-inner italic" 
                                 value={v.price} 
                                 onChange={e => updateVariant(idx, 'price', e.target.value)} 
                               />
                             </div>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Qty</label>
                             <input 
                               type="text"
                               inputMode="numeric"
                               className="w-full h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-4 focus:outline-none shadow-inner" 
                               value={v.stock} 
                               onChange={e => updateVariant(idx, 'stock', e.target.value)} 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</label>
                             <Select value={v.condition} onValueChange={val => updateVariant(idx, 'condition', val)}>
                               <SelectTrigger className="h-14 bg-slate-50 border-none font-bold rounded-2xl"><SelectValue /></SelectTrigger>
                               <SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="New" className="font-bold">New</SelectItem><SelectItem value="Used - Grade A" className="font-bold">Grade A</SelectItem><SelectItem value="Used - Grade B" className="font-bold">Grade B</SelectItem></SelectContent>
                             </Select>
                           </div>
                        </div>
                      </CardContent>
                   </Card>
                 ))}
               </div>
             </div>

             {/* Advanced Specifications JSON Column */}
             {!isSimpleCategory && (
               <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
                 <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight italic font-headline">Advanced <span className="text-blue-500">Details</span></h2>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Optional technical data</p>
                    </div>
                    <Settings2 className="w-10 h-10 text-blue-500 opacity-50" />
                 </div>
                 <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {basicInfo.category === "Laptops" ? (
                         <>
                           {[
                             { id: 'res', label: 'Screen Resolution', placeholder: 'e.g. 1920x1080' },
                             { id: 'ports', label: 'I/O Ports', placeholder: 'e.g. 3x USB, 1x HDMI' },
                             { id: 'battery', label: 'Battery Life', placeholder: 'e.g. 8-10 Hours' },
                             { id: 'os', label: 'Operating System', placeholder: 'e.g. Windows 11 Pro' },
                             { id: 'audio', label: 'Speakers/Audio', placeholder: 'e.g. Stereo Speakers' }
                           ].map(f => (
                             <div key={f.id} className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                                <Input placeholder={f.placeholder} className="h-14 bg-slate-50 border-none font-bold rounded-xl" value={advancedSpecs[f.id] || ""} onChange={e => setAdvancedSpecs({...advancedSpecs, [f.id]: e.target.value})} />
                             </div>
                           ))}
                         </>
                       ) : (
                         <>
                           {[
                             { id: 'camera', label: 'Camera Specs', placeholder: 'e.g. 50MP Main' },
                             { id: 'refresh', label: 'Refresh Rate', placeholder: 'e.g. 120Hz' },
                             { id: 'charge', label: 'Charging Speed', placeholder: 'e.g. 67W' },
                             { id: 'rating', label: 'Protection Rating', placeholder: 'e.g. IP68' },
                             { id: 'biometrics', label: 'Security', placeholder: 'e.g. Face ID' }
                           ].map(f => (
                             <div key={f.id} className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                                <Input placeholder={f.placeholder} className="h-14 bg-slate-50 border-none font-bold rounded-xl" value={advancedSpecs[f.id] || ""} onChange={e => setAdvancedSpecs({...advancedSpecs, [f.id]: e.target.value})} />
                             </div>
                           ))}
                         </>
                       )}
                    </div>
                 </CardContent>
               </Card>
             )}

             <div className="flex justify-end pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="h-20 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl uppercase tracking-widest text-lg shadow-2xl shadow-blue-600/30 gap-4 transition-all hover:scale-[1.02]">
                   {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8" />} Commit All Changes
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
