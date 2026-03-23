import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Camera,
  ArrowRight,
  Briefcase,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";

const SKILLS = [
  "Plumber",
  "Electrician",
  "Painter",
  "Carpenter",
  "Cleaner",
  "Driver",
  "Cook",
  "Helper",
  "Mason",
  "Gardener",
  "Other",
];

const WorkerProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.full_name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [skill, setSkill] = useState(profile?.skills?.[0] || "");
  const [pay, setPay] = useState(
    profile?.expected_pay_per_day?.toString() || "",
  );
  const [location, setLocation] = useState(profile?.location_name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    profile?.avatar_url || null,
  );
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
      toast.error("Please fill your name and select a role");
      return;
    }
    if (role === "worker" && (!skill || !pay || !location)) {
      toast.error("Please fill all worker fields");
      return;
    }
    if (!user) return;
    setLoading(true);

    let avatar_url = profile?.avatar_url || null;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        toast.error("Failed to upload photo");
        setLoading(false);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      avatar_url = publicUrl;
    }

    const profileData = {
      id: user.id,
      full_name: name,
      role,
      avatar_url,
    };

    if (role === "worker") {
      profileData.skills = [skill];
      profileData.expected_pay_per_day = Number(pay);
      profileData.location_name = location;
    } else {
      profileData.location_name = location || null;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Profile saved!");
      navigate("/");
    }
  };

  return (
    <AppShell
      showNav={false}
      header={<h2 className="font-bold text-foreground">Setup Profile</h2>}
    >
      <div className="px-4 py-6 space-y-5">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <label className="relative cursor-pointer press group">
            <div className="w-24 h-24 rounded-full bg-muted border-3 border-border flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors shadow-sm">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={28} className="text-muted-foreground" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
              Add Photo
            </span>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-xl bg-card"
            placeholder="Your name"
          />
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("worker")}
              className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                role === "worker"
                  ? "border-primary bg-primary/8 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              {role === "worker" && (
                <CheckCircle2
                  size={16}
                  className="absolute top-2.5 right-2.5 text-primary"
                />
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === "worker" ? "bg-primary/15" : "bg-muted"}`}
              >
                <Wrench
                  size={22}
                  className={
                    role === "worker" ? "text-primary" : "text-muted-foreground"
                  }
                />
              </div>
              <span
                className={`text-sm font-bold ${role === "worker" ? "text-primary" : "text-foreground"}`}
              >
                Worker
              </span>
              <span className="text-[10px] text-muted-foreground">
                Find jobs nearby
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("hirer")}
              className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                role === "hirer"
                  ? "border-primary bg-primary/8 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              {role === "hirer" && (
                <CheckCircle2
                  size={16}
                  className="absolute top-2.5 right-2.5 text-primary"
                />
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === "hirer" ? "bg-primary/15" : "bg-muted"}`}
              >
                <Briefcase
                  size={22}
                  className={
                    role === "hirer" ? "text-primary" : "text-muted-foreground"
                  }
                />
              </div>
              <span
                className={`text-sm font-bold ${role === "hirer" ? "text-primary" : "text-foreground"}`}
              >
                Business
              </span>
              <span className="text-[10px] text-muted-foreground">
                Hire workers
              </span>
            </button>
          </div>
        </motion.div>

        {/* Worker-specific fields */}
        {role === "worker" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Primary Skill
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full h-14 rounded-xl border border-input bg-card px-4 text-base font-medium"
              >
                <option value="">Select a skill</option>
                {SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Expected Pay / Day (₹)
              </label>
              <Input
                type="number"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                className="h-14 rounded-xl bg-card"
                placeholder="500"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Location
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-14 rounded-xl bg-card"
            placeholder="City or area"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={handleSave}
            disabled={loading || !role}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Profile"}
            <ArrowRight size={18} />
          </Button>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default WorkerProfileSetup;
