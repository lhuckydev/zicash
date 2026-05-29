"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Info, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWADebugPage() {
  const [swStatus, setSwStatus] = useState<string>("Checking...");
  const [manifestDetected, setManifestDetected] = useState<boolean | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        setSwStatus(reg ? `Active: ${reg.active ? 'Running' : 'Installing'}` : "Not Found");
      });
    } else {
      setSwStatus("Not Supported by Browser");
    }

    // Check for manifest link
    const manifest = document.querySelector('link[rel="manifest"]');
    setManifestDetected(!!manifest);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-black uppercase italic">PWA <span className="text-blue-600">Diagnostics</span></h1>
          
          <div className="grid gap-4">
             <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <ShieldCheck className="w-6 h-6 text-blue-600" />
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Service Worker</p>
                      <p className="font-bold">{swStatus}</p>
                   </div>
                </div>
                {swStatus.includes("Active") ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
             </div>

             <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Info className="w-6 h-6 text-blue-600" />
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Manifest Presence</p>
                      <p className="font-bold">{manifestDetected ? "Detected in DOM" : "Not Found"}</p>
                   </div>
                </div>
                {manifestDetected ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
             </div>
          </div>

          <div className="p-8 bg-blue-600 text-white rounded-3xl space-y-4">
             <h3 className="font-black uppercase tracking-tight">How to verify "Install App"</h3>
             <ul className="text-sm space-y-2 opacity-80 list-disc pl-4">
                <li>Use Android Chrome or Desktop Edge/Chrome.</li>
                <li>Clear browser storage/cache if status is "Not Found".</li>
                <li>Chrome requires a <b>Fetch Handler</b> in sw.js to show "Install App".</li>
                <li>Wait 30 seconds on the homepage for the custom banner.</li>
             </ul>
             <Button onClick={() => window.location.reload()} className="bg-white text-blue-600 font-bold w-full rounded-xl gap-2">
                <RefreshCcw className="w-4 h-4" /> Refresh Diagnostics
             </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
