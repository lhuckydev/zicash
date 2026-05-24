"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } else {
      toast({ 
        title: "Credential Sync Success", 
        description: "Your account access key has been updated." 
      });
      router.push("/auth");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 tech-grid pb-24 md:pb-12">
        <Card className="w-full max-w-md glass-panel border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">
              Credential <span className="text-blue-600 italic">Sync</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-2 px-6">
              Establish a new high-security access key for your ZiCash profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-10 pb-10">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">New Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/50 border-slate-100 rounded-2xl h-12 pl-12 pr-12 focus-visible:ring-blue-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20 text-white transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Sync"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
