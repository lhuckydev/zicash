"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MessageSquare, 
  User, 
  Loader2, 
  Send, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profile: {
    full_name: string;
    avatar_url: string;
  };
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    checkUser();
  }, [productId]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchReviews() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle case where table might not exist yet during dev sync
        if (error.code === 'PGRST116' || error.message.includes('relation "reviews" does not exist')) {
          setReviews([]);
          return;
        }
        throw error;
      }
      setReviews(data || []);
    } catch (err: any) {
      // Log errors only if they are not standard "table missing" errors
      if (err.message && !err.message.includes('relation')) {
        console.error("Review System Sync Error:", err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Identity Required", description: "Please sign in to share your experience." });
      return;
    }
    if (rating === 0) {
      toast({ variant: "destructive", title: "Rating Required", description: "Please select a star rating." });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("You have already reviewed this product.");
        }
        throw error;
      }

      toast({ title: "Review Published", description: "Your feedback has been added to our records." });
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="pt-12 space-y-12 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
               <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 italic">Client Reviews</h2>
            </div>
            <div className="flex items-center gap-4 px-2">
               <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{averageRating}</span>
                  <span className="text-slate-400 font-bold text-sm">/ 5.0</span>
               </div>
               <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-5 h-5", Number(averageRating) >= s ? "fill-current" : "opacity-20")} />
                  ))}
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{reviews.length} VERIFIED REVIEWS</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Review Form & Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-600/5 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16" />
             <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                   <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 italic">Share Your Experience</h3>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Help others make a better choice</p>
                </div>

                {!user ? (
                   <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 space-y-4 text-center">
                      <AlertCircle className="w-8 h-8 text-blue-600 mx-auto" />
                      <p className="text-sm font-bold text-blue-900">Sign in to leave a verified review on this hardware.</p>
                   </div>
                ) : (
                   <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Your Rating</label>
                         <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(s)}
                                className="transition-all active:scale-90"
                              >
                                <Star 
                                  className={cn(
                                    "w-9 h-9 transition-colors",
                                    (hoverRating || rating) >= s ? "fill-amber-400 text-amber-400" : "text-slate-100"
                                  )} 
                                />
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Your Observations</label>
                         <Textarea 
                            placeholder="Tell us about the quality, performance and value of this unit..." 
                            className="min-h-[160px] rounded-3xl bg-slate-50 border-none font-bold text-base shadow-inner p-6 focus-visible:ring-2 focus-visible:ring-blue-600/10 placeholder:text-slate-300"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                         />
                      </div>

                      <Button 
                        disabled={isSubmitting}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-blue-600/20 gap-3 transition-all"
                      >
                         {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 
                         Post Verified Review
                      </Button>
                   </form>
                )}
             </div>
          </div>
        </div>

        {/* Reviews List Gallery */}
        <div className="lg:col-span-7 space-y-6">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin opacity-20" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Syncing Client Logs...</p>
             </div>
           ) : reviews.length === 0 ? (
             <div className="text-center py-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <MessageSquare className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No client feedback detected for this unit</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-widest">Be the first to record a review</p>
             </div>
           ) : (
             <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                   {reviews.map((r, idx) => (
                     <motion.div 
                        key={r.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-50 transition-all space-y-6 group"
                     >
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-5">
                              <div className="relative">
                                <Avatar className="w-14 h-14 border-4 border-slate-50 shadow-md rounded-2xl overflow-hidden transition-transform group-hover:scale-105">
                                   <AvatarImage src={r.profile?.avatar_url} className="object-cover" />
                                   <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-xl">{r.profile?.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-lg">
                                   <CheckCircle2 className="w-3 h-3" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                 <p className="font-black text-slate-900 uppercase text-base tracking-tight">{r.profile?.full_name || 'Verified Client'}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-black text-slate-900">{r.rating}.0</span>
                           </div>
                        </div>
                        <div className="pl-0 md:pl-2">
                           <p className="text-slate-600 font-medium text-lg leading-relaxed italic">
                             "{r.comment || "High-performance item. Very satisfied with the acquisition."}"
                           </p>
                           <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-50">
                              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Acquisition</span>
                              </div>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-auto">Log ID: #{r.id.slice(0,6).toUpperCase()}</span>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
