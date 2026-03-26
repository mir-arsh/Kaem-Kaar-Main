import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  LogOut,
  ArrowRightLeft,
  Star,
  Pencil,
  MapPin,
  Wrench,
  IndianRupee,
  Sun,
  Moon,
} from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <AppShell header={<h2 className="font-bold text-foreground">Profile</h2>}>
      <div className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-primary/10 rounded-3xl p-6 flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-card border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-extrabold text-muted-foreground">
                {profile?.full_name?.[0] ||
                  user?.email?.[0]?.toUpperCase() ||
                  "?"}
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-xl text-foreground mt-3">
            {profile?.full_name || user?.email || "No name set"}
          </h3>
          <span className="text-xs font-bold uppercase tracking-widest text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full">
            {profile?.role || "No role"}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex items-center gap-3 border border-border rounded-2xl p-4 bg-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wrench size={18} className="text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Skills
                </span>
                <p className="font-bold text-foreground text-sm">
                  {profile.skills.join(", ")}
                </p>
              </div>
            </div>
          )}
          {profile?.expected_pay_per_day && (
            <div className="flex items-center gap-3 border border-border rounded-2xl p-4 bg-card">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <IndianRupee size={18} className="text-success" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Expected Pay
                </span>
                <p className="font-bold text-foreground text-sm">
                  ₹{profile.expected_pay_per_day}/day
                </p>
              </div>
            </div>
          )}
          {profile?.location_name && (
            <div className="flex items-center gap-3 border border-border rounded-2xl p-4 bg-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Location
                </span>
                <p className="font-bold text-foreground text-sm">
                  {profile.location_name}
                </p>
              </div>
            </div>
          )}
          {profile?.rating_avg !== undefined &&
            profile?.rating_avg !== null &&
            profile.rating_avg > 0 && (
              <div className="flex items-center gap-3 border border-border rounded-2xl p-4 bg-card">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Star size={18} className="text-primary fill-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Rating
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {profile.rating_avg.toFixed(1)} / 5.0
                  </p>
                </div>
              </div>
            )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between border border-border rounded-2xl p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {theme === "dark" ? (
                  <Moon size={18} className="text-primary" />
                ) : (
                  <Sun size={18} className="text-primary" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Theme
                </span>
                <p className="font-bold text-foreground text-sm">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </p>
              </div>
            </div>
            <Switch checked={theme === "light"} onCheckedChange={toggleTheme} />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/profile/setup")}
          >
            <Pencil size={16} /> Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/role-selection")}
          >
            <ArrowRightLeft size={16} /> Switch Role
          </Button>
          <Button
            variant="ghost"
            className="w-full text-destructive"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
          >
            <LogOut size={16} /> Logout
          </Button>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
