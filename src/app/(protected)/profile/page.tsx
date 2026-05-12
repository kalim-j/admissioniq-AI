"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { 
  Camera, Save, User, MapPin, 
  Award, BookOpen, Phone, Loader2,
  Sparkles, ShieldCheck, Mail, Briefcase,
  Target, GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    state: "",
    district: "",
    stream: "",
    courseLevel: "UG" as "UG" | "PG",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        state: profile.state || "",
        district: profile.district || "",
        stream: profile.stream || "",
        courseLevel: (profile.courseLevel as "UG" | "PG") || "UG",
        phone: profile.phone || "",
      });
    }
  }, [profile, user, loading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date(),
      });
      await refreshProfile();
      toast.success("Intelligence profile updated!");
    } catch (error: any) {
      toast.error("Failed to update profile data.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "eduanalytics_avatars");
    data.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      const url = fileData.secure_url;

      await updateDoc(doc(db, "users", user.uid), {
        avatarUrl: url,
      });
      await refreshProfile();
      toast.success("Identity updated!");
    } catch (error) {
      toast.error("Avatar upload sequence failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 py-16 max-w-6xl relative z-10">
        <header className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Identity Management</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Your Profile</h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Manage your personal and academic intelligence</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Identity Card */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-[3rem] border border-white/5 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl relative"
            >
              <div className="h-32 bg-gradient-to-r from-indigo-600/20 to-teal-600/20 border-b border-white/5" />
              <div className="px-8 pb-10 -mt-16 flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <Avatar className="h-40 w-40 border-[6px] border-[#05071a] shadow-2xl">
                    <AvatarImage src={profile?.avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-5xl font-black bg-indigo-500/20 text-indigo-400">
                      {profile?.fullName?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-2 right-2 h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 transition-all border-4 border-[#05071a]">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={uploading} accept="image/*" />
                  </label>
                </div>
                
                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{profile?.fullName}</h2>
                <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mt-2">{profile?.courseLevel} Student</p>
                <div className="w-full h-px bg-white/5 my-8" />
                
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-4 text-sm p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40">
                    <Mail size={18} className="text-indigo-500" />
                    <span className="font-bold truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40">
                    <MapPin size={18} className="text-indigo-500" />
                    <span className="font-bold text-left">{profile?.state ? `${profile.district}, ${profile.state}` : "Location not set"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Update Intelligence Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-14">
                <form onSubmit={handleUpdateProfile} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <User size={12} className="text-indigo-500" /> Full Identity Name
                      </label>
                      <input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Sparkles size={12} className="text-indigo-500" /> Personal Bio
                      </label>
                      <input
                        placeholder="My ambition is to..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MapPin size={12} className="text-indigo-500" /> State
                      </label>
                      <input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="e.g. Tamil Nadu"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MapPin size={12} className="text-indigo-500" /> District
                      </label>
                      <input
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="e.g. Chennai"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Briefcase size={12} className="text-indigo-500" /> Targeted Stream
                      </label>
                      <input
                        value={formData.stream}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="e.g. Engineering"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Phone size={12} className="text-indigo-500" /> Secure Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center gap-6">
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="btn-primary h-16 px-12 text-base font-black gap-3 w-full sm:w-auto"
                    >
                      {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      {saving ? "Updating Profile..." : "Commit Changes"}
                    </button>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic text-center sm:text-left">
                      Identity data is used for personalized AI matching algorithms.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
