
"use client";

import { useState } from "react";
import { getLaptopSpecSummary } from "@/ai/flows/laptop-spec-summary";
import { accessoryCompatibilityRecommendation } from "@/ai/flows/accessory-compatibility-recommendation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit, Cable, RefreshCcw, Info, CheckCircle2, ShieldCheck, Clock, Send, Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SpecAdvisor() {
  const [specs, setSpecs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!specs.trim()) return;
    setIsLoading(true);
    try {
      const summaryResult = await getLaptopSpecSummary({ specs });
      const recommendationsResult = await accessoryCompatibilityRecommendation({ laptopSpecs: specs });
      
      const safeSummary = typeof summaryResult.summary === 'string' 
        ? summaryResult.summary 
        : JSON.stringify(summaryResult.summary);
        
      setSummary(safeSummary);
      setRecommendations(recommendationsResult.accessories || []);
    } catch (error) {
      console.error("Helper Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSpecs("");
    setSummary(null);
    setRecommendations([]);
  };

  return (
    <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
      <AnimatePresence mode="wait">
        {!summary ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10 py-10"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 mx-auto">
                <BrainCircuit className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 font-headline uppercase italic">
                Hardware <span className="text-blue-600">Analyzer</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium max-w-md mx-auto leading-relaxed">
                Paste raw technical data or hardware strings for neural interpretation and compatibility matching.
              </p>
            </div>

            <div className="relative group max-w-2xl mx-auto w-full">
              <div className="absolute inset-0 bg-blue-600/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2rem]" />
              <div className="relative bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-600/5 transition-all">
                <textarea
                  placeholder="Paste specs here (e.g. Core i7 12th Gen, 16GB RAM, RTX 3060...)"
                  className="w-full min-h-[180px] bg-transparent border-none focus:ring-0 font-medium text-slate-800 text-sm placeholder:text-slate-300 resize-none"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                />
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isLoading || !specs.trim()}
                    className="h-12 px-8 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 transition-all gap-3"
                  >
                    {isLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isLoading ? "Analyzing Node..." : "Initiate Interpretation"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-10"
          >
            {/* User Input Bubble */}
            <div className="flex justify-end">
              <div className="max-w-[85%] p-5 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-lg text-sm font-medium">
                {specs}
              </div>
            </div>

            {/* AI Result Bubble */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-6 flex-1">
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100 text-slate-700 text-sm md:text-base leading-relaxed font-medium shadow-sm italic">
                  "{summary}"
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Cable className="w-4 h-4 text-blue-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Compatible Modules</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors"
                      >
                        <h4 className="text-xs font-black text-slate-900 uppercase italic mb-2">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {item.compatibilityExplanation}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest hover:opacity-70 transition-opacity ml-2"
                >
                  <RefreshCcw className="w-3 h-3" /> Start New Analysis
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
