"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceHighlights } from "@/components/layout/ServiceHighlights";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { 
  Loader2, User, Mail, Save, LogOut, Phone, MapPin, 
  Camera, Navigation, AlertCircle 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    contact: "",
    location: "",
    avatar_url: "",
    latitude: null as number | null,
    longitude: null as number | null,
    accuracy: null as number | null,
    google_maps_link: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        toast({ variant: "destructive", title: "Error", description: "Failed to load profile." });
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          contact: data.contact || "",
          location: data.location || "",
          avatar_url: data.avatar_url || "",
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          accuracy: data.accuracy || null,
          google_maps_link: data.google_maps_link || "",
        });
      }
      setIsLoading(false);
    }

    getProfile();
  }, [router, toast]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported", description: "Your browser doesn't support location features." });
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const gMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'ZiCash-App' } }
          );
          
          const data = await response.json();
          const readableAddress = data.display_name || "Location found";

          setProfile(prev => ({
            ...prev,
            location: readableAddress,
            latitude,
            longitude,
            accuracy,
            google_maps_link: gMapsLink
          }));

          toast({ title: "Location Saved", description: "Your delivery address has been updated." });
        } catch (err) {
          console.error("Geocoding error:", err);
          setProfile(prev => ({ ...prev, latitude, longitude, accuracy, google_maps_link: gMapsLink }));
          toast({ title: "Coordinates Saved", description: "Found coordinates, but could not resolve address." });
        } finally { setIsLocating(false); }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Could not find your location.";
        if (error.code === 1) msg = "Location access was denied.";
        setLocationError(msg);
        toast({ variant: "destructive", title: "Location Error", description: msg });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setProfile({ ...profile, avatar_url: publicUrl });
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() });
      toast({ title: "Picture Updated", description: "Your profile picture has been saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally { setIsUploading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.location || !profile.contact) {
      toast({ variant: "destructive", title: "Wait", description: "Please provide a phone number and address." });
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, email: user.email, full_name: profile.full_name, contact: profile.contact, location: profile.location,
      avatar_url: profile.avatar_url, latitude: profile.latitude, longitude: profile.longitude,
      accuracy: profile.accuracy, google_maps_link: profile.google_maps_link, updated_at: new Date().toISOString(),
    });
    if (error) toast({ variant: "destructive", title: "Update Failed", description: error.message });
    else toast({ title: "Profile Saved", description: "Your information has been updated." });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12 tech-grid pb-24 md:pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <ServiceHighlights />

          <div className="mb-8 space-y-2">
            <h1 className="text-4xl font-headline font-bold">Account <span className="text-primary italic">Settings</span></h1>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Manage Your Profile</p>
          </div>

          <div className="grid gap-8">
            {isLoading ? (
              <>
                <Skeleton className="h-64 w-full rounded-[2rem]" />
                <Skeleton className="h-96 w-full rounded-[2rem]" />
              </>
            ) : (
              <>
                <Card className="glass-panel border-white/5 overflow-hidden rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="h-32 bg-primary/10 w-full border-b border-white/5 relative" />
                  <CardContent className="relative pt-0 pb-10">
                    <div className="absolute -top-16 left-8 flex flex-col items-center">
                      <div className="relative group">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-2xl rounded-full overflow-hidden">
                          <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
                          <AvatarFallback className="bg-slate-100 text-3xl font-bold uppercase text-slate-400">{user?.email?.[0]}</AvatarFallback>
                        </Avatar>
                        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </div>
                    </div>
                    <div className="pt-20 flex flex-col justify-between items-start gap-2">
                      <h2 className="text-3xl font-headline font-bold text-slate-900">{profile.full_name || "Guest User"}</h2>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium"><Mail className="w-4 h-4" /> {user?.email}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-white/5 rounded-[2rem] shadow-xl animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
                  <CardHeader className="p-8">
                    <CardTitle className="font-headline font-bold text-xl uppercase tracking-tight flex items-center gap-2"><User className="w-6 h-6 text-primary" /> Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <form onSubmit={handleUpdate} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                        <Input placeholder="e.g., John Doe" className="pl-4 h-14 bg-slate-50 border-none rounded-2xl font-bold" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                          <Input placeholder="+233..." className="pl-4 h-14 bg-slate-50 border-none rounded-2xl font-bold" value={profile.contact} onChange={(e) => setProfile({...profile, contact: e.target.value})} />
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Delivery Address</label>
                            <Input placeholder="Street, City, Area" className="pl-4 h-14 bg-slate-50 border-none rounded-2xl font-bold" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} />
                          </div>
                          <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isLocating} className="w-full h-12 rounded-2xl border-primary/20 bg-primary/5 text-primary font-bold uppercase text-[10px] gap-2">
                            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />} {isLocating ? "Finding location..." : "Use Current Location"}
                          </Button>
                        </div>
                      </div>
                      <Button className="w-full h-16 bg-primary font-bold uppercase rounded-2xl text-white shadow-xl shadow-primary/20" disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />} Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}