"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Box, 
  Banknote, 
  Image as ImageIcon, 
  Loader2, 
  ArrowLeft,
  Lock,
  Save,
  Upload,
  Hash,
  Cpu,
  Monitor,
  Database,
  Smartphone,
  Camera,
  Shirt,
  GraduationCap,
  Zap,
  Info,
  Trash2,
  X
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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";

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
    clock_speed: "",
    screen_resolution: "",
    cpu: "",
    ram_size: "",
    storage_size: "",
    gpu: "",
    camera: "",
    battery: "",
    size: "",
    material: "",
    color: ""
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const isSimpleCategory = ["Accessories", "Educational Consult"].includes(product.category || "");
  const isConsult = product.category === "Educational Consult";

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
      toast({ variant: "destructive", title: "Fetch Error", description: err.message });
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

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const getPlaceholder = () => {
    switch (product.category) {
      case "Laptops": return "e.g., MacBook Pro 14 M3 Max";
      case "Phones": return "e.g., iPhone 15 Pro Max";
      case "Closet": return "e.g., ZiCash Signature Tech Hoodie";
      case "Accessories": return "e.g., Logitech MX Master 3S Mouse";
      case "Educational Consult": return "e.g., Undergraduate Admission Support";
      default: return "Full Product Title";
    }
  };

  const handleSave = async () => {
    if (!product.name || !product.price) {
      toast({ variant: "destructive", title: "Wait", description: "Name and Price are required." });
      return;
    }

    setIsSaving(true);
    let finalImageUrls = [...existingImages];

    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);
          
          finalImageUrls.push(publicUrl);
        }
      }

      let finalSpecs = "";
      if (product.category === "Laptops") {
        finalSpecs = `CPU: ${product.cpu || "Standard"} | RAM: ${product.ram_size || "Standard"} | Storage: ${product.storage_size || "Standard"} | GPU: ${product.gpu || "Standard"} | Screen: ${product.screen_resolution || "Standard"} | Speed: ${product.clock_speed || "Standard"}`;
      } else if (product.category === "Phones") {
        finalSpecs = `Chipset: ${product.cpu || "Standard"} | RAM: ${product.ram_size || "Standard"} | Storage: ${product.storage_size || "Standard"} | Camera: ${product.camera || "Standard"} | Battery: ${product.battery || "Standard"}`;
      } else if (product.category === "Closet") {
        finalSpecs = `Size: ${product.size || "Standard"} | Material: ${product.material || "Standard"} | Color: ${product.color || "Standard"} | Condition: ${product.condition || "New"}`;
      } else {
        finalSpecs = product.specs || "Standard Unit";
      }

      const { error } = await supabase
        .from('products')
        .update({
          ...product,
          image_url: finalImageUrls[0] || "",
          image_urls: finalImageUrls,
          specs: finalSpecs,
          description: product.description || "",
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Update Success", description: "Product has been successfully synchronized." });
      router.push("/admin");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failure", description: err.message });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 opacity-20" /></div>;

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[#0F172A] tech-grid">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
           <div className="bg-slate-950 p-10 text-center">
               <h1 className="text-white font-black text-2xl uppercase">Admin <span className="text-blue-500 italic">Auth</span></h1>
           </div>
           <CardContent className="p-10">
             <form onSubmit={handleAuth} className="space-y-6">
               <Input type="password" placeholder="Key" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-black" />
               <Button className="w-full h-14 bg-blue-600 font-black rounded-2xl text-white uppercase tracking-widest">Login</Button>
             </form>
           </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 tech-grid pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" className="gap-2 font-black text-slate-500 hover:text-blue-600">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Modifier Node</p>
            <h1 className="text-2xl font-black text-slate-900 mt-1 uppercase italic">Edit <span className="text-blue-600">Product</span></h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Stack */}
          <div className="lg:col-span-1 space-y-8">
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[15px] font-black uppercase text-blue-700 ml-1">1. Modify Department</label>
                    <Select value={product.category} onValueChange={(val) => setProduct({ ...product, category: val })}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black shadow-sm focus:ring-2 focus:ring-blue-600/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Laptops" className="font-black">Laptops</SelectItem>
                        <SelectItem value="Phones" className="font-black">Phones</SelectItem>
                        <SelectItem value="Accessories" className="font-black">Accessories</SelectItem>
                        <SelectItem value="Educational Consult" className="font-black">Educational Consult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[12px] font-black uppercase text-slate-400 ml-1">2. Media Payload (Multi)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-600 transition-all mb-6"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase text-slate-400">Add Images</p>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-slate-400">Inventory Photos</p>
                       <div className="grid grid-cols-3 gap-2">
                          {existingImages.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group/img">
                              <Image src={url} alt="Product" fill className="object-cover" />
                              <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {previewUrls.map((url, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 ring-2 ring-blue-500/20 group/img">
                              <Image src={url} alt="New" fill className="object-cover" />
                              <button onClick={() => removeSelectedFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-black uppercase tracking-widest text-blue-600 ml-1">3. Price (GH₵)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600 text-lg">GH₵</div>
                      <Input type="number" className="pl-16 h-14 rounded-xl bg-blue-50/50 border-none font-black italic text-2xl text-slate-900 focus-visible:ring-blue-600/20" value={product.price} onChange={(e) => setProduct({...product, price: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase text-slate-400 ml-1">4. Stock Count</label>
                    <Input type="number" className="h-12 rounded-xl bg-slate-50 border-none font-black text-lg" value={product.stock} onChange={(e) => setProduct({...product, stock: parseInt(e.target.value)})} />
                  </div>
                </div>
             </Card>
          </div>

          {/* Configuration Stack */}
          <div className="lg:col-span-2 space-y-8">
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-10 bg-slate-950 text-white flex justify-between items-center">
                   <div><CardTitle className="text-2xl uppercase tracking-tighter">Product <span className="text-blue-500 italic">Blueprint</span></CardTitle></div>
                   <div className="p-3 bg-blue-600 rounded-2xl">
                     {product.category === "Laptops" && <Monitor className="w-6 h-6" />}
                     {product.category === "Phones" && <Smartphone className="w-6 h-6" />}
                     {product.category === "Closet" && <Shirt className="w-6 h-6" />}
                     {product.category === "Educational Consult" && <GraduationCap className="w-6 h-6" />}
                   </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[12px] font-black uppercase text-slate-400 ml-1">Product Title</label>
                        <Input placeholder={getPlaceholder()} className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
                      </div>

                      {!isConsult && (
                        <div className="space-y-2">
                          <label className="text-[12px] font-black uppercase text-slate-400 ml-1">Brand</label>
                          <Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.brand} onChange={(e) => setProduct({...product, brand: e.target.value})} />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase text-slate-400 ml-1">Condition</label>
                        <Select value={product.condition} onValueChange={(val) => setProduct({ ...product, condition: val })}>
                           <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg"><SelectValue /></SelectTrigger>
                           <SelectContent className="rounded-2xl">
                              <SelectItem value="New" className="font-black">New</SelectItem>
                              <SelectItem value="Used - Grade A" className="font-black">Grade A</SelectItem>
                              <SelectItem value="Used - Grade B" className="font-black">Grade B</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                   </div>

                   {!isSimpleCategory && product.category === "Laptops" && (
                     <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">CPU</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.cpu} onChange={(e) => setProduct({...product, cpu: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">RAM</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.ram_size} onChange={(e) => setProduct({...product, ram_size: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">Storage</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.storage_size} onChange={(e) => setProduct({...product, storage_size: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">Clock Speed</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.clock_speed} onChange={(e) => setProduct({...product, clock_speed: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">Resolution</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.screen_resolution} onChange={(e) => setProduct({...product, screen_resolution: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">GPU</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.gpu} onChange={(e) => setProduct({...product, gpu: e.target.value})} /></div>
                     </div>
                   )}

                   {!isSimpleCategory && product.category === "Phones" && (
                     <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">Chipset</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.cpu} onChange={(e) => setProduct({...product, cpu: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">RAM</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.ram_size} onChange={(e) => setProduct({...product, ram_size: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">Internal</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.storage_size} onChange={(e) => setProduct({...product, storage_size: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[12px] font-black text-slate-400 ml-1">Camera</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.camera} onChange={(e) => setProduct({...product, camera: e.target.value})} /></div>
                        <div className="space-y-2 md:col-span-2"><label className="text-[12px] font-black text-slate-400 ml-1">Battery</label><Input className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={product.battery} onChange={(e) => setProduct({...product, battery: e.target.value})} /></div>
                     </div>
                   )}

                   <div className="space-y-2">
                      <label className="text-[12px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Info className="w-3 h-3" /> Descriptive Payload (Marketing Text)</label>
                      <Textarea className="rounded-2xl bg-slate-50 border-none min-h-[150px] font-black text-lg leading-relaxed" value={product.description || ""} onChange={(e) => setProduct({...product, description: e.target.value})} />
                   </div>

                   <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl text-white uppercase tracking-widest text-xl shadow-2xl shadow-blue-600/20 gap-3">
                      {isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />} Save Changes
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
