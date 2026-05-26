import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Eye, Database, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pb-24 md:pb-12 bg-slate-50 tech-grid">
        <div className="container mx-auto px-6 py-12 md:py-24 max-w-4xl space-y-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
               <Lock className="w-8 h-8" />
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Privacy <span className="text-slate-900">Policy</span></h1>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Data Encryption Standards Active</p>
          </div>

          <div className="space-y-10">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <Database className="w-5 h-5 text-blue-600" /> Data Collection
              </h2>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>We collect essential information required to fulfill your hardware orders and optimize your marketplace experience. This includes your name, contact details, and precise delivery coordinates.</p>
                <p>Your payment data (MoMo sender names and screenshots) is stored securely and accessed only by authorized financial administrators for transaction verification.</p>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <Eye className="w-5 h-5 text-blue-600" /> Information Sharing
              </h2>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>ZiCash GH Limited does not sell, trade, or rent your personal identity data to third-party entities. We only share information with our trusted logistics partners to ensure your hardware reaches its destination efficiently.</p>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Security Standards
              </h2>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>We implement industry-standard encryption and security measures to protect your account. Users are encouraged to establish strong passwords and utilize our secure Google Sign-In integration for enhanced protection.</p>
              </div>
            </section>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
