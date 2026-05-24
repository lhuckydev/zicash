import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Gavel, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pb-24 md:pb-12 bg-slate-50 tech-grid">
        <div className="container mx-auto px-6 py-12 md:py-24 max-w-4xl space-y-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
               <Gavel className="w-8 h-8" />
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Terms & <span className="text-slate-900">Conditions</span></h1>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Last Comprehensive Update: 5/21/26</p>
          </div>

          <div className="space-y-10">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <FileText className="w-5 h-5 text-blue-600" /> 1. Service Agreement
              </h2>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>Welcome to ZiCash GH Limited. By accessing our marketplace at zicashgh.com or purchasing any products, you agree to comply with and be bound by the following protocols.</p>
                <p>The term 'ZiCash GH Limited' or 'us' or 'we' refers to the owner of the marketplace. The term 'you' refers to the user, viewer, or customer of our digital platform.</p>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <ShieldAlert className="w-5 h-5 text-blue-600" /> 2. Ordering & Payments
              </h2>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>Orders placed via our digital node are subject to verification. Payment on Delivery (POD) is exclusively available for the Greater Accra Region. For all other regions in Ghana, full prepayment via Mobile Money is required before shipment initiation.</p>
                <p>Verification of payments may take up to 2 hours during standard business cycles.</p>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> 3. Warranty & Returns
              </h2>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>All items sold by ZiCash GH Limited come with a standard limited warranty against defects. The duration and terms of this warranty vary by product category and are specified on the receipt provided at delivery.</p>
                <p>Returns are accepted within 48 hours if the product does not match the specifications or condition described in our index at the time of purchase.</p>
              </div>
            </section>

            <div className="p-10 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl space-y-4 italic">
               <h3 className="text-2xl font-black uppercase">Standard Disclosure</h3>
               <p className="text-sm font-medium opacity-80 leading-relaxed">
                 ZiCash GH Limited reserves the right to modify these protocols at any time without prior notice. Continued use of the platform constitutes acceptance of the current active terms.
               </p>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
