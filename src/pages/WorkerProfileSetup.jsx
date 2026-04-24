import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, ArrowRight, Briefcase, Wrench, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";

const SKILLS = ["Plumber", "Electrician", "Painter", "Carpenter", "Cleaner", "Driver", "Cook", "Helper", "Mason", "Gardener", "Other"];

const WorkerProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(profile?.full_name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [skill, setSkill] = useState(profile?.skills?.[0] || "");
  const [pay, setPay] = useState(profile?.expected_pay_per_day?.toString() || "");
  const [location, setLocation] = useState(profile?.location_name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name || !role) {
      toast.error("Name and Role are required");
      return;
    }
    if (role === "worker" && (!skill || !pay || !location)) {
      toast.error("Please fill all worker details");
      return;
    }
    
    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url || null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = publicUrl;
      }

      const profileData = {
        id: user.id,
        full_name: name,
        role: role,
        avatar_url: avatar_url,
        location_name: location,
        updated_at: new Date(),
      };

      if (role === "worker") {
        profileData.skills = [skill];
        profileData.expected_pay_per_day = Number(pay);
      } else {
        // Clear worker data if they switch to hirer
        profileData.skills = null;
        profileData.expected_pay_per_day = null;
      }

      const { error } = await supabase.from("profiles").upsert(profileData);
      if (error) throw error;

      await refreshProfile();
      toast.success("Profile saved!");
      navigate("/", { replace: true });

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell showNav={false} header={<h2 className="font-bold text-foreground">Edit Profile</h2>}>
      <div className="px-4 py-6 space-y-6 pb-12">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <div className="w-24 h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden shadow-sm transition-colors group-hover:border-primary/50">
              {avatarPreview ? (
                <img src={avatarPreview} className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} className="text-muted-foreground" />
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg">
              <Camera size={14} />
            </div>
          </label>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-14 rounded-xl" placeholder="Your name" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setRole("worker")} 
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'worker' ? 'border-primary bg-primary/5' : 'bg-card'}`}
              >
                <Wrench className={role === 'worker' ? 'text-primary' : 'text-muted-foreground'} />
                <span className="font-bold text-sm">Work</span>
              </button>
              <button 
                type="button"
                onClick={() => setRole("hirer")} 
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'hirer' ? 'border-primary bg-primary/5' : 'bg-card'}`}
              >
                <Briefcase className={role === 'hirer' ? 'text-primary' : 'text-muted-foreground'} />
                <span className="font-bold text-sm">Hire</span>
              </button>
            </div>
          </div>

          {role === "worker" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Primary Skill</label>
                <select 
                  value={skill} 
                  onChange={(e) => setSkill(e.target.value)} 
                  className="w-full h-14 rounded-xl border bg-card px-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a skill</option>
                  {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Daily Pay (₹)</label>
                <Input type="number" value={pay} onChange={(e) => setPay(e.target.value)} className="h-14 rounded-xl" placeholder="e.g. 500" />
              </div>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-14 rounded-xl" placeholder="City or area" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading || !role} className="w-full h-14 rounded-xl text-md font-bold shadow-lg">
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Save Profile Changes"}
          {!loading && <ArrowRight className="ml-2" size={18} />}
        </Button>
      </div>
    </AppShell>
  );
};

export default WorkerProfileSetup;