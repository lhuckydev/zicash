"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      toast({ variant: "destructive", title: "Request Failed", description: error.message });
    } else {
      toast({ 
        title: "Recovery Sent", 
        description: "If an account exists for this email, you will receive a reset link shortly." 
      });
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
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">
              Access <span className="text-blue-600 italic">Recovery</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-2 px-6">
              Enter your registered email to receive a secure recovery node.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-10 pb-10">
            <form onSubmit={handleResetRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="nexus@zicash.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/50 border-slate-100 rounded-2xl h-12 pl-12 focus-visible:ring-blue-600/20"
                  />
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20 text-white transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Transmit Reset Node"}
              </Button>
            </form>

            <Link href="/auth" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </Link>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
