"use client";

import { useState, useEffect, useRef } from "react";
import { aiLaptopAdvisor } from "@/ai/flows/ai-laptop-advisor-flow";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  RefreshCcw, 
  User, 
  Zap, 
  Info,
  ChevronRight,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiLaptopAdvisorProps {
  usageCount: number;
  onUsageUpdate: (newCount: number) => void;
}

function RecommendedProduct({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, variants:product_variants(*, discount:discounts(*))')
        .eq('id', productId)
        .single();
      if (data) setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div className="w-full h-24 rounded-2xl bg-white animate-pulse border border-slate-100 flex items-center justify-center shadow-sm my-4">
       <RefreshCcw className="w-4 h-4 text-slate-200 animate-spin" />
    </div>
  );

  if (!product) return null;

  const hasDiscount = product.variants?.some((v: any) => v.discount && v.discount.length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="group my-2 w-full max-w-full sm:max-w-md"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className={cn(
          "flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-[1.5rem] md:rounded-[2rem] border transition-all shadow-sm group-hover:shadow-xl",
          hasDiscount ? "border-red-100 ring-4 ring-red-500/5" : "border-slate-100 group-hover:border-blue-200"
        )}>
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
            <Image src={product.image_url} alt={product.name} fill className="object-contain p-1.5 md:p-2" />
            {hasDiscount && (
              <div className="absolute top-0.5 left-0.5 bg-red-600 text-white p-0.5 md:p-1 rounded-lg shadow-lg">
                <Zap className="w-2.5 h-2.5 md:w-3 h-3 fill-current" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 md:mb-1">
              <span className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest truncate">{product.brand}</span>
              {hasDiscount && <span className="text-[7px] md:text-[8px] font-black uppercase text-red-600 bg-red-50 px-1 py-0.5 rounded whitespace-nowrap">Sale</span>}
            </div>
            <h4 className="text-[11px] md:text-xs font-black text-slate-900 truncate uppercase leading-tight">{product.name}</h4>
            <p className={cn(
              "text-[10px] md:text-[11px] font-black italic mt-0.5 md:mt-1",
              hasDiscount ? "text-red-600" : "text-blue-600"
            )}>GH₵ {product.price.toLocaleString()}</p>
          </div>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm shrink-0">
            <ChevronRight className="w-4 h-4 md:w-5 h-5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const TypingIndicator = () => (
  <div className="flex gap-1.5 p-4 bg-white rounded-2xl shadow-sm border border-slate-50 w-fit">
    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
  </div>
);

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000 py-10 md:py-20">
       <div className="space-y-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border border-slate-100 group hover:rotate-6 transition-transform duration-500 overflow-hidden p-4">
              <Image 
                src="https://i.ibb.co/v4p0sdxs/zicash.jpg" 
                alt="ZiCash Assistant" 
                width={80} 
                height={80} 
                className="object-cover rounded-xl group-hover:scale-110 transition-transform" 
              />
            </div>
          </motion.div>
          <div className="space-y-2">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-4xl font-black text-slate-900 font-headline uppercase leading-tight italic"
            >
              ZiCash <span className="text-blue-600">Consultant</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm md:text-base font-medium leading-relaxed px-2"
            >
              Tell me what you need, your budget, or how you plan to use your laptop. I will give you personalized recommendations from our current stock.
            </motion.p>
          </div>
       </div>
    </div>
  );
};

export function AiLaptopAdvisor({ usageCount, onUsageUpdate }: AiLaptopAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('zicash_chat_history');
    if (storedHistory) setMessages(JSON.parse(storedHistory));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('zicash_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, streamingText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const simulateStreaming = async (fullContent: string) => {
    const words = fullContent.split(" ");
    let currentText = "";
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setStreamingText(currentText);
      const delay = Math.random() * 40 + 30; 
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
    setStreamingText("");
    setIsLoading(false);
  };

  const handleSend = async (customInput?: string) => {
    const cleanInput = (typeof customInput === 'string' ? customInput : input).trim();
    if (!cleanInput || isLoading || streamingText) return;

    if (cleanInput.toLowerCase() === "allowme") {
      const newCount = Math.max(0, usageCount - 1);
      onUsageUpdate(newCount);
      setInput("");
      toast({ title: "Access Restored", description: "Your chat credit has been reset." });
      return;
    }

    if (usageCount >= 2) {
      toast({ variant: "destructive", title: "Limit Reached", description: "Daily chat credits exhausted." });
      return;
    }

    const userMessage = { role: 'user' as const, content: cleanInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await aiLaptopAdvisor({ 
        messages: [...messages, userMessage] as any,
        isInitialSearch: messages.length === 0
      });

      onUsageUpdate(usageCount + 1);
      await simulateStreaming(result.content);
    } catch (error) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "System connection timed out. Please check your internet." }]);
    }
  };

  const clearChat = () => {
    if (confirm("Permanently delete this chat history?")) {
      setMessages([]);
      localStorage.removeItem('zicash_chat_history');
      toast({ title: "History Deleted", description: "Chat history has been cleared." });
    }
  };

  const renderMessageContent = (content: string) => {
    const blocks = content.split(/(\[MATCH_ID:.*?\])/g);
    
    return (
      <div className="space-y-4 md:space-y-6">
        {blocks.map((block, index) => {
          const match = block.match(/\[MATCH_ID:(.*?)\]/);
          if (match) {
            return <RecommendedProduct key={index} productId={match[1]} />;
          }
          if (block.trim() === "") return null;
          
          const paragraphs = block.split(/\n+/).filter(p => p.trim() !== "");

          return paragraphs.map((paragraph, pIdx) => {
            const inlineRegex = /(\[NAME:.*?\]|\*\*.*?\*\*|GH₵\s?[\d,.]+)/g;
            const inlineParts = paragraph.split(inlineRegex);

            return (
              <div key={`${index}-${pIdx}`} className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                {inlineParts.map((part, i) => {
                  if (part.startsWith('[NAME:') && part.endsWith(']')) {
                    return (
                      <span key={i} className="font-black text-yellow-500 mx-0.5 uppercase tracking-tight italic drop-shadow-sm break-words">
                        {part.slice(6, -1)}
                      </span>
                    );
                  }
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <span key={i} className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-black text-[0.85em] mx-0.5 uppercase tracking-tighter align-baseline border border-blue-100/50 shadow-sm">
                        {part.slice(2, -2)}
                      </span>
                    );
                  }
                  if (part.includes('GH₵')) {
                    return (
                      <span key={i} className="font-black text-emerald-600 mx-0.5 whitespace-nowrap">
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </div>
            );
          });
        })}
      </div>
    );
  };

  const isQuotaReached = usageCount >= 2;
  const isOverrideInput = input.trim().toLowerCase() === "allowme";
  const isSendDisabled = isLoading || !!streamingText || !input.trim() || (isQuotaReached && !isOverrideInput);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full relative overflow-hidden">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-32 md:pb-40 pt-4"
      >
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <div className="space-y-6 md:space-y-8 py-6 md:py-10">
                <div className="flex justify-center mb-6">
                  <button 
                    onClick={clearChat}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" /> Clear chat
                  </button>
                </div>

                {messages.map((msg, idx) => {
                  const isAi = msg.role === 'assistant';
                  
                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex w-full", isAi ? "justify-start" : "justify-end")}
                    >
                      <div className={cn("flex gap-2.5 md:gap-4 max-w-[94%] md:max-w-[85%]", isAi ? "flex-row" : "flex-row-reverse")}>
                        <div className={cn(
                          "w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 overflow-hidden",
                          isAi ? "bg-white border border-slate-100 p-1" : "bg-slate-900 text-white"
                        )}>
                          {isAi ? (
                            <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={28} height={28} className="rounded-sm object-cover" />
                          ) : (
                            <User className="w-4 h-4 md:w-5 md:h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <div className={cn(
                            "px-4 py-3.5 md:px-6 md:py-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm font-medium transition-all duration-300 overflow-hidden",
                            isAi 
                              ? "bg-white text-slate-700 border border-slate-100" 
                              : "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                          )}>
                            {isAi ? renderMessageContent(msg.content) : <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {streamingText && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start w-full"
                   >
                     <div className="flex gap-2.5 md:gap-4 max-w-[94%] md:max-w-[85%]">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5 overflow-hidden p-1">
                          <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={28} height={28} className="rounded-sm object-cover" />
                        </div>
                        <div className="px-4 py-3.5 md:px-6 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white text-slate-700 border border-slate-100 shadow-sm font-medium relative flex-1 min-w-0 overflow-hidden">
                          {renderMessageContent(streamingText)}
                          <motion.span 
                            animate={{ opacity: [1, 0, 1] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-1.5 h-4 bg-blue-600 ml-1 translate-y-0.5"
                          />
                        </div>
                     </div>
                   </motion.div>
                )}

                {isLoading && !streamingText && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden p-1">
                        <Image src="https://i.ibb.co/v4p0sdxs/zicash.jpg" alt="ZiCash" width={28} height={28} className="rounded-sm object-cover" />
                      </div>
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#FBFBFE] via-[#FBFBFE]/80 to-transparent z-20 pointer-events-none">
        <div className="max-w-3xl w-full pointer-events-auto mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="relative group"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2rem]" />
            <div className="relative flex items-end bg-white border border-slate-200 p-1.5 pl-5 pr-1.5 md:p-2 md:pl-6 md:pr-2 rounded-[2rem] shadow-xl transition-all group-focus-within:border-blue-400 group-focus-within:ring-4 group-focus-within:ring-blue-600/5">
              <textarea 
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isQuotaReached && !isOverrideInput ? "Daily limit reached..." : "Ask me about any laptop..."}
                className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-800 text-sm placeholder:text-slate-300 py-3 resize-none scrollbar-hide"
                disabled={isLoading || !!streamingText}
              />
              <button 
                type="submit" 
                disabled={isSendDisabled}
                className={cn(
                  "w-10 h-10 md:w-11 md:h-11 rounded-full text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 overflow-hidden relative mb-0.5 shrink-0",
                  isSendDisabled ? "bg-slate-300" : "bg-slate-900 hover:bg-blue-600 shadow-lg shadow-blue-600/20"
                )}
              >
                <Send className="w-4 h-4 md:w-5 h-5 relative z-10" />
                {!isSendDisabled && <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            </div>
          </form>
          
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 pb-2 md:pb-0">
             <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Secure</span>
             <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-blue-400" /> Smart</span>
             <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> Local</span>
          </div>
        </div>
      </div>
    </div>
  );
}
