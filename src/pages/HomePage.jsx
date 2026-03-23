import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Wrench,
  Plus,
  Star,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const HomePage = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isHirer = profile?.role === "hirer";
  const [jobCount, setJobCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      if (isHirer) {
        const { count } = await supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("hirer_id", user.id);
        setJobCount(count || 0);
      } else {
        const { count } = await supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("worker_id", user.id);
        setJobCount(count || 0);
      }
      // Unread-ish: count distinct job threads with messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("job_id")
        .limit(100);
      const uniqueJobs = new Set(msgs?.map((m) => m.job_id));
      setMsgCount(uniqueJobs.size);
    };
    fetchStats();
  }, [user, isHirer]);

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">
            Kaem Kaar
          </h1>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden press"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <span className="text-sm font-bold text-primary">
                {profile?.full_name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </button>
        </div>
      }
    >
      <div className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-extrabold text-foreground">
            Hello, {profile?.full_name?.split(" ")[0] || "there"} 👋
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {isHirer
              ? "Post a job and find workers nearby."
              : "Find work nearby. Get paid today."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Briefcase size={20} className="text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {isHirer ? "Jobs Posted" : "Applications"}
            </span>
            <p className="font-bold text-foreground text-xl mt-0.5">
              {jobCount}
            </p>
          </div>
          <div
            className="bg-card border border-border rounded-2xl p-4"
            onClick={() => navigate("/messages")}
            role="button"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Chats
            </span>
            <p className="font-bold text-foreground text-xl mt-0.5">
              {msgCount}
            </p>
          </div>
          {!isHirer && (
            <>
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                  <span className="text-success font-bold text-sm">₹</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Pay/Day
                </span>
                <p className="font-bold text-foreground text-xl mt-0.5">
                  ₹{profile?.expected_pay_per_day || "—"}
                </p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Star size={20} className="text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Rating
                </span>
                <p className="font-bold text-foreground text-xl mt-0.5">
                  {profile?.rating_avg ? profile.rating_avg.toFixed(1) : "New"}
                </p>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          {isHirer ? (
            <>
              <Button className="w-full" onClick={() => navigate("/post-job")}>
                <Plus size={18} /> Post a Job
                <ArrowRight size={16} className="ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/jobs")}
              >
                <Briefcase size={18} /> View Your Jobs
                <ArrowRight size={16} className="ml-auto" />
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={() => navigate("/jobs")}>
              <Wrench size={18} /> Browse Jobs
              <ArrowRight size={16} className="ml-auto" />
            </Button>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
};

export default HomePage;
