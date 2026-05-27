
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Zap, 
  MessageCircle, 
  Globe,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slide } from "./AdminSlideManager";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SlideUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSlide?: Slide | null;
}

export function SlideUploadModal({ isOpen, onClose, onSuccess, editingSlide }: SlideUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    link_type: "internal" as const,
    is_active: true
  });

  useEffect(() => {
    if (editingSlide) {
      setFormData({
        title: editingSlide.title || "",
        subtitle: editingSlide.subtitle || "",
        link: editingSlide.link || "",
        link_type: editingSlide.link_type,
        is_active: editingSlide.is_active
      });
      setPreviewUrl(editingSlide.image_url);
    } else {
      setFormData({ title: "", subtitle: "", link: "", link_type: "internal", is_active: true });
      setPreviewUrl(null);
      setImageFile(null);
    }
  }, [editingSlide, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl && !imageFile) {
      toast({ variant: "destructive", title: "Image Required", description: "Please upload a banner graphic." });
      return;
    }

    setIsLoading(true);
    let finalImageUrl = previewUrl;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('slideshow-banners')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('slideshow-banners')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      }

      if (editingSlide) {
        const { error } = await supabase
          .from('slideshow_slides')
          .update({ ...formData, image_url: finalImageUrl })
          .eq('id', editingSlide.id);
        if (error) throw error;
        toast({ title: "Banner Updated", description: "Changes saved to the rotation." });
      } else {
        const { error } = await supabase
          .from('slideshow_slides')
          .insert([{ ...formData, image_url: finalImageUrl }]);
        if (error) throw error;
        toast({ title: "Banner Published", description: "The new slide is now active." });
      }

      onSuccess();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-slate-900 text-white flex flex-row items-center justify-between">
           <div>
              <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Banner <span className="text-blue-500">Configuration</span></DialogTitle>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Set display parameters for marketing graphics.</p>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/40 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto scrollbar-hide">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Banner Graphic</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer group hover:border-blue-600 transition-all overflow-hidden"
                    >
                      {previewUrl ? (
                         <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                      ) : (
                         <>
                            <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-blue-600 transition-colors" />
                            <p className="text-[8px] font-black uppercase text-slate-400">Add Marketing Asset</p>
                         </>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Main Heading (Optional)</label>
                    <Input className="h-12 rounded-xl bg-slate-50 border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subtext (Optional)</label>
                    <Input className="h-12 rounded-xl bg-slate-50 border-none font-medium" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Action</label>
                    <div className="space-y-4">
                       <Select value={formData.link_type} onValueChange={(val: any) => setFormData({...formData, link_type: val})}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                             <SelectItem value="internal" className="font-bold">Internal Route (Shop)</SelectItem>
                             <SelectItem value="external" className="font-bold">External Website</SelectItem>
                             <SelectItem value="whatsapp" className="font-bold">WhatsApp Direct</SelectItem>
                          </SelectContent>
                       </Select>
                       <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                             {formData.link_type === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4 text-blue-500" />}
                          </div>
                          <Input 
                            placeholder={formData.link_type === 'whatsapp' ? "024XXXXXXX" : "/categories"} 
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold" 
                            value={formData.link} 
                            onChange={e => setFormData({...formData, link: e.target.value})} 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><Zap className="w-4 h-4" /></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">Optimization Active</span>
                    </div>
                    <p className="text-[9px] font-bold text-blue-600/60 uppercase leading-relaxed">
                       Banners are automatically optimized for mobile responsiveness and fast rendering across the node.
                    </p>
                 </div>

                 <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      {editingSlide ? "Commit Updates" : "Publish Banner"}
                    </Button>
                 </div>
              </div>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
