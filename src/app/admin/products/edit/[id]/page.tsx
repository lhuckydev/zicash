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
  MousePointer2
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
import { Product } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SESSION_TIMEOUT = 7200000;

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

  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    brand: "",
    category: "Laptops",
    price: 0,
    stock: 10,
    image_url: "",
    image_urls: [],
    description: "",
    specs: "",
    condition: "New",
    featured: false
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProduct(data);
      setExistingImages(data.image_urls || [data.image_url]);
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
      toast({ variant: "destructive", title: "Denied", description: "Incorrect key." });
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

  const isFormValid = () => {
    return product.name?.trim().length > 0 && (product.price || 0) > 0;
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

      const { error } = await supabase
        .from('products')
        .update({
          ...product,
          image_url: finalImageUrls[0] || "",
          image_urls: finalImageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Updated Successfully", description: "Changes saved to catalog." });
      router.push("/admin");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handlePriceInput = (val: string) => {
    if (val === "") {
      setProduct({ ...product, price: undefined });
    } else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) setProduct({ ...product, price: parsed });
    }
  };

  const handleStockInput = (val: string) => {
    if (val === "") {
      setProduct({ ...product, stock: undefined });
    } else {
      const parsed = parseInt(val);
      if (!isNaN(parsed)) setProduct({ ...product, stock: parsed });
    }
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-24 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase text-blue-700 ml-1">Department</label>
                    <Select value={product.category} onValueChange={(val) => setProduct({ ...product, category: val })}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none">
                        <SelectItem value="Laptops" className="font-black">Laptops</SelectItem>
                        <SelectItem value="Phones" className="font-black">Phones</SelectItem>
                        <SelectItem value="Accessories" className="font-black">Accessories</SelectItem>
                        <SelectItem value="Educational Consult" className="font-black">Educational Consult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[12px] font-black uppercase text-slate-400 ml-1">Gallery</label>
                    <div onClick={() => fileInputRef.current?.click()} className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition-all mb-4">
                      <Upload className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-[10px] font-black uppercase text-slate-400">Add Media</p>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-blue-600 ml-1">Base Price (GHS)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600">GHS</div>
                      <Input type="number" className="pl-14 h-14 rounded-xl bg-blue-50/50 border-none font-black italic text-xl" value={product.price ?? ""} onChange={(e) => handlePriceInput(e.target.value)} />
                    </div>
                  </div>
                </div>
             </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
             <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="p-10 bg-slate-900 text-white flex justify-between items-center">
                   <CardTitle className="text-2xl uppercase tracking-tighter italic">Basic <span className="text-blue-500">Info</span></CardTitle>
                   <div className="p-3 bg-blue-600 rounded-2xl">
                     {product.category === "Laptops" && <Monitor className="w-6 h-6" />}
                     {product.category === "Phones" && <Smartphone className="w-6 h-6" />}
                     {product.category === "Educational Consult" && <GraduationCap className="w-6 h-6" />}
                   </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Hardware Title</label>
                        <Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg shadow-inner" value={product.name ?? ""} onChange={(e) => setProduct({...product, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Brand</label>
                        <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={product.brand ?? ""} onChange={(e) => setProduct({...product, brand: e.target.value})} />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                         <div>
                            <p className="font-black text-slate-900 uppercase text-xs">Featured Item</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Show on homepage</p>
                         </div>
                         <Switch checked={product.featured ?? false} onCheckedChange={(val) => setProduct({...product, featured: val})} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Product Description</label>
                      <Textarea className="rounded-2xl bg-slate-50 border-none min-h-[150px] font-medium text-lg leading-relaxed shadow-inner" value={product.description || ""} onChange={(e) => setProduct({...product, description: e.target.value})} />
                   </div>

                   <Button onClick={handleSave} disabled={isSaving || !isFormValid()} className="w-full h-16 font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-lg shadow-2xl shadow-blue-600/20 gap-3">
                      {isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />} Save All Changes
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
