import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import JobCard from "@/components/JobCard";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const JobFeedPage = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const isHirer = profile?.role === "hirer";

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (isHirer && profile) {
      query = query.eq("hirer_id", profile.id);
    } else {
      query = query.eq("status", "open");
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load jobs");
    } else {
      setJobs(data || []);
    }

    // Fetch applied jobs for workers
    if (!isHirer && user) {
      const { data: apps } = await supabase
        .from("applications")
        .select("job_id")
        .eq("worker_id", user.id);
      setAppliedJobIds(new Set(apps?.map((a) => a.job_id) || []));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [profile?.role]);

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

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between w-full">
          <h2 className="font-bold text-foreground">
            {isHirer ? "Your Jobs" : "Find Work"}
          </h2>
          {isHirer && (
            <Button size="sm" onClick={() => navigate("/post-job")}>
              <Plus size={16} /> Post Job
            </Button>
          )}
        </div>
      }
    >
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
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} className="text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-bold text-sm">
              {isHirer
                ? "You haven't posted any jobs yet."
                : "No jobs available right now."}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Check back soon!
            </p>
          </motion.div>
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
