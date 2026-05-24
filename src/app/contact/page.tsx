import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Phone, MessageCircle, Mail, MapPin, Clock, ShieldCheck, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ContactPage() {
  const supportNumber = "+233256985825";
  const supportDisplay = "+233 25 698 5825";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pb-24 md:pb-12 bg-slate-50 tech-grid">
        <div className="container mx-auto px-6 py-12 md:py-24 max-w-5xl space-y-16">
          
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
              24/7 Universal Support Node
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Get In <span className="text-blue-600">Touch</span></h1>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Have questions about an order or need assistance with our marketplace services? Our support team is ready to provide expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Communication Nodes */}
            <div className="space-y-8">
               <Card className="border-none shadow-2xl rounded-[2.5rem] bg-blue-600 text-white overflow-hidden p-10 space-y-8 hover:scale-[1.01] transition-transform duration-500">
                  <div className="flex items-center justify-between">
                     <Headphones className="w-10 h-10 opacity-40" />
                     <ShieldCheck className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Primary Customer Hub</h3>
                     <p className="text-3xl font-black font-headline italic">{supportDisplay}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <Link href={`tel:${supportNumber}`} className="w-full">
                        <Button className="w-full h-16 bg-white text-blue-600 font-black rounded-2xl uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-black/10 hover:bg-blue-50 transition-colors">
                           <Phone className="w-4 h-4" /> Initiate Call Transmission
                        </Button>
                     </Link>
                     <Link href={`https://wa.me/${supportNumber.replace('+', '')}`} target="_blank" className="w-full">
                        <Button className="w-full h-16 bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-black/10 hover:bg-emerald-600 border-none transition-colors">
                           <MessageCircle className="w-4 h-4" /> WhatsApp Support Link
                        </Button>
                     </Link>
                  </div>
               </Card>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Mail className="w-5 h-5" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Email Sync</p>
                        <p className="font-bold text-slate-900 text-sm">support@zicashonline.com</p>
                     </div>
                  </div>
                  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Clock className="w-5 h-5" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Operation Cycle</p>
                        <p className="font-bold text-slate-900 text-sm">Mon - Sat | 8AM - 8PM</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Location Matrix */}
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col">
               <div className="h-48 bg-slate-900 relative">
                  <div className="absolute inset-0 tech-grid opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <MapPin className="w-12 h-12 text-blue-500 animate-bounce" />
                  </div>
               </div>
               <CardContent className="p-10 space-y-8 flex-1">
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black font-headline uppercase italic">Marketplace <span className="text-blue-600">Headquarters</span></h3>
                     <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Visit our main distribution hub for consultations and pick-up of pre-verified inventory items.
                     </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Address Node</p>
                     <p className="text-slate-900 font-bold leading-relaxed">Accra Metropolis, Greater Accra Region, Ghana.</p>
                  </div>
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] gap-3">
                     <MapPin className="w-4 h-4" /> Open in Navigation Node
                  </Button>
               </CardContent>
            </Card>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
