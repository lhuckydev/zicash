"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  MessageCircle, 
  Link as LinkIcon,
  Loader2,
  RefreshCcw,
  Zap,
  Edit,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SlideUploadModal } from "./SlideUploadModal";
import Image from "next/image";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Slide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  link_type: 'internal' | 'external' | 'whatsapp';
  is_active: boolean;
  position: number;
}

export function AdminSlideManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('slideshow_slides')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      setSlides(data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('slideshow_slides')
        .update({ is_active: !current })
        .eq('id', id);
      
      if (error) throw error;
      setSlides(slides.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast({ title: "Status Updated", description: "Slide visibility has been modified." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this promotional slide?")) return;
    try {
      const { error } = await supabase.from('slideshow_slides').delete().eq('id', id);
      if (error) throw error;
      setSlides(slides.filter(s => s.id !== id));
      toast({ title: "Slide Removed", description: "The banner has been deleted." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Error", description: err.message });
    }
  };

  const handleReorder = async (newOrder: Slide[]) => {
    setSlides(newOrder);
    const updates = newOrder.map((slide, index) => ({
      id: slide.id,
      position: index
    }));

    try {
      const { error } = await supabase.from('slideshow_slides').upsert(updates as any);
      if (error) throw error;
    } catch (err) {
      console.error("Reorder sync error:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic">Slideshow <span className="text-blue-600">Assets</span></h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Manage your homepage marketing banners.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" onClick={fetchSlides} className="h-12 w-12 rounded-2xl text-slate-400 hover:text-blue-600">
              <RefreshCcw className={cn("w-5 h-5", isLoading && "animate-spin")} />
           </Button>
           <Button onClick={() => { setEditingSlide(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-blue-600/20">
              <Plus className="w-4 h-4" /> Add New Banner
           </Button>
        </div>
      </div>

      {isLoading && slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin opacity-20" />
        </div>
      ) : (
        <Reorder.Group axis="y" values={slides} onReorder={handleReorder} className="space-y-4">
          <AnimatePresence initial={false}>
            {slides.map((slide) => (
              <Reorder.Item key={slide.id} value={slide}>
                <Card className={cn(
                  "p-4 md:p-6 rounded-[2rem] border-none shadow-sm flex flex-col md:flex-row items-center gap-6 transition-all group",
                  slide.is_active ? "bg-white" : "bg-slate-50 opacity-60"
                )}>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="relative w-32 h-20 md:w-48 md:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                      <Image src={slide.image_url} alt="Banner" fill className="object-cover" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center md:text-left min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                       <h3 className="font-black text-slate-900 uppercase italic truncate">{slide.title || "No Title"}</h3>
                       <Badge className={cn(
                         "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border-none",
                         slide.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-400"
                       )}>
                         {slide.is_active ? "Active" : "Hidden"}
                       </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{slide.subtitle || "Marketing graphic"}</p>
                    <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                          {slide.link_type === 'whatsapp' ? <MessageCircle className="w-3 h-3 text-emerald-500" /> : <LinkIcon className="w-3 h-3 text-blue-500" />}
                          <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 truncate max-w-[150px]">{slide.link || "No Link"}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 md:pt-0 border-t md:border-none border-slate-100 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase text-slate-400">Visibility</span>
                       <Switch 
                         checked={slide.is_active} 
                         onCheckedChange={() => handleToggleActive(slide.id, slide.is_active)}
                         className="data-[state=checked]:bg-emerald-500"
                       />
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => { setEditingSlide(slide); setIsModalOpen(true); }}
                         className="h-10 w-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDelete(slide.id)}
                         className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </Card>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {slides.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <ImageIcon className="w-12 h-12 text-slate-100 mb-4" />
           <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No active banners in rotation.</p>
        </div>
      )}

      <SlideUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { setIsModalOpen(false); fetchSlides(); }}
        editingSlide={editingSlide}
      />
    </div>
  );
}
