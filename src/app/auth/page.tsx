"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
    } else {
      toast({ title: "Account Created", description: "Please check your email to verify your account." });
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } else {
      toast({ title: "Welcome back!", description: "You are now logged in." });
      router.push("/");
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
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">
              Sign <span className="text-blue-600 italic">In</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-2">
              Join the ZiCash community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-10 pb-10">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl border-2 border-blue-700 bg-white/50 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:border-blue-800 transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                <span className="bg-white/80 px-4 text-slate-400">Or use email</span>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
                <TabsTrigger value="login" className="rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-blue-600">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-blue-600">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/50 border-slate-100 rounded-2xl h-12 pl-12 focus-visible:ring-blue-600/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                      <Link href="/auth/forgot-password"><span className="text-[10px] font-bold uppercase text-blue-600">Forgot Password?</span></Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/50 border-slate-100 rounded-2xl h-12 pl-12 pr-12 focus-visible:ring-blue-600/20" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/50 border-slate-100 rounded-2xl h-12 pl-12 focus-visible:ring-blue-600/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 ml-1">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/50 border-slate-100 rounded-2xl h-12 pl-12 pr-12 focus-visible:ring-blue-600/20" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}