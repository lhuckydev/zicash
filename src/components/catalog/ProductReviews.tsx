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

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error("Review Fetch Error:", err);
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
        {/* Review Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-600/5 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16" />
             <div className="relative z-10 space-y-6">
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 italic">Share Your Experience</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Help others make a better choice</p>
                </div>

                {!user ? (
                   <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-4 text-center">
                      <AlertCircle className="w-8 h-8 text-blue-600 mx-auto" />
                      <p className="text-sm font-bold text-blue-900">Sign in to leave a verified review.</p>
                   </div>
                ) : (
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Rating</label>
                         <div className="flex gap-2">
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
                                    "w-8 h-8 transition-colors",
                                    (hoverRating || rating) >= s ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                  )} 
                                />
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Comment</label>
                         <Textarea 
                            placeholder="Tell us about the quality and performance..." 
                            className="h-32 rounded-2xl bg-slate-50 border-none font-bold text-sm shadow-inner p-4 focus-visible:ring-blue-600/10"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                         />
                      </div>

                      <Button 
                        disabled={isSubmitting}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 gap-3"
                      >
                         {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                         Post Verified Review
                      </Button>
                   </form>
                )}
             </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-7 space-y-6">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-20" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Syncing client feedback...</p>
             </div>
           ) : reviews.length === 0 ? (
             <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Be the first to review this unit</p>
             </div>
           ) : (
             <div className="space-y-4">
                <AnimatePresence>
                   {reviews.map((r, idx) => (
                     <motion.div 
                        key={r.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4"
                     >
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-lg rounded-2xl">
                                 <AvatarImage src={r.profile?.avatar_url} className="object-cover" />
                                 <AvatarFallback className="bg-blue-50 text-blue-600 font-black">{r.profile?.full_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-sm">{r.profile?.full_name || 'Verified Client'}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={cn("w-4 h-4", r.rating >= s ? "fill-current" : "opacity-20")} />
                              ))}
                           </div>
                        </div>
                        <div className="pl-16">
                           <p className="text-slate-600 font-medium leading-relaxed italic">"{r.comment}"</p>
                           <div className="flex items-center gap-1.5 mt-4 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Verified Transaction</span>
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
