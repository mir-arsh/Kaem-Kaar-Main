import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import JobCard from "@/components/JobCard";
import WorkerCard from "@/components/WorkerCard";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Users } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const JobFeedPage = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isHirer = profile?.role === "hirer";

  // Hirers have two tabs: My Jobs | Find Workers
  const [tab, setTab] = useState("jobs");

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (isHirer) {
      query = query.eq("hirer_id", profile.id);
    } else {
      query = query.eq("status", "open");
    }

    const { data, error } = await query;
    if (error) toast.error("Failed to load jobs");
    else setJobs(data || []);

    if (!isHirer && user) {
      const { data: apps } = await supabase
        .from("applications")
        .select("job_id")
        .eq("worker_id", user.id);
      setAppliedJobIds(new Set(apps?.map((a) => a.job_id) || []));
    }

    setLoading(false);
  };

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("worker_availability")
      .select("*, profiles(full_name, avatar_url, rating_avg)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load workers");
    else setWorkers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "jobs" || !isHirer) fetchJobs();
    if (tab === "workers" && isHirer) fetchWorkers();
  }, [profile?.role, tab]);

  const handleApply = async (jobId) => {
    if (!user) return;
    const job = jobs.find((j) => j.id === jobId);
    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      worker_id: user.id,
      status: "pending",
    });
    if (error) {
      toast.error(error.code === "23505" ? "Already applied" : error.message);
    } else {
      const applicantName = profile?.full_name || "Someone";
      await supabase.from("messages").insert({
        job_id: jobId,
        sender_id: user.id,
        content: `👋 ${applicantName} applied for "${job?.title || "this job"}"`,
      });
      toast.success("Applied successfully!");
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
    }
  };

  const EmptyState = ({ icon: Icon, message }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-muted-foreground/40" />
      </div>
      <p className="text-muted-foreground font-bold text-sm">{message}</p>
      <p className="text-muted-foreground text-xs mt-1">Check back soon!</p>
    </motion.div>
  );

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between w-full">
          <h2 className="font-bold text-foreground">
            {isHirer
              ? tab === "jobs"
                ? "Your Jobs"
                : "Find Workers"
              : "Find Work"}
          </h2>
          {isHirer && tab === "jobs" && (
            <Button size="sm" onClick={() => navigate("/post-job")}>
              <Plus size={16} /> Post Job
            </Button>
          )}
          {!isHirer && (
            <Button size="sm" onClick={() => navigate("/post-availability")}>
              <Plus size={16} /> I'm Available
            </Button>
          )}
        </div>
      }
    >
      {/* Tabs for hirers */}
      {isHirer && (
        <div className="flex gap-1 mx-4 mt-4 bg-muted p-1 rounded-xl">
          <button
            onClick={() => setTab("jobs")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "jobs"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Briefcase size={14} /> My Jobs
          </button>
          <button
            onClick={() => setTab("workers")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "workers"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Users size={14} /> Find Workers
          </button>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border border-border rounded-2xl bg-card"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-40 skeleton-shimmer rounded-lg" />
                  <div className="h-7 w-14 skeleton-shimmer rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-24 skeleton-shimmer rounded-lg" />
                  <div className="h-6 w-20 skeleton-shimmer rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : tab === "workers" && isHirer ? (
          workers.length === 0 ? (
            <EmptyState
              icon={Users}
              message="No workers available right now."
            />
          ) : (
            workers.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <WorkerCard
                  name={w.profiles?.full_name || "Worker"}
                  skill={w.skill}
                  location={w.location_name}
                  pay={w.pay_per_day}
                  date={w.available_date}
                  rating={w.profiles?.rating_avg || 0}
                  avatarUrl={w.profiles?.avatar_url}
                  onContact={() => toast.info("Chat with worker coming soon!")}
                />
              </motion.div>
            ))
          )
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            message={
              isHirer
                ? "You haven't posted any jobs yet."
                : "No jobs available right now."
            }
          />
        ) : (
          jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <JobCard
                title={job.title}
                location={job.location_name || "Unknown"}
                pay={job.pay_amount}
                date={job.job_date || "TBD"}
                status={
                  !isHirer && appliedJobIds.has(job.id)
                    ? "applied"
                    : job.status || undefined
                }
                onApply={
                  !isHirer && !appliedJobIds.has(job.id)
                    ? () => handleApply(job.id)
                    : undefined
                }
                onView={() => navigate(`/jobs/${job.id}`)}
              />
            </motion.div>
          ))
        )}
      </div>
    </AppShell>
  );
};

export default JobFeedPage;
