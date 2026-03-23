import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import WorkerCard from "@/components/WorkerCard";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const JobDetailPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setJob(data);

      if (data && user) {
        if (data.hirer_id === user.id) {
          const { data: apps } = await supabase
            .from("applications")
            .select(
              "*, profiles!applications_worker_id_fkey(full_name, skills, expected_pay_per_day, avatar_url, rating_avg)",
            )
            .eq("job_id", id);
          setApplications(apps || []);
        } else {
          // Check if worker already applied
          const { data: myApp } = await supabase
            .from("applications")
            .select("id")
            .eq("job_id", id)
            .eq("worker_id", user.id)
            .maybeSingle();
          setHasApplied(!!myApp);
        }
      }
      setLoading(false);
    };
    fetchJob();
  }, [id, user]);

  const handleSelectWorker = async (appId) => {
    await supabase
      .from("applications")
      .update({ status: "accepted" })
      .eq("id", appId);
    await supabase.from("jobs").update({ status: "assigned" }).eq("id", id);
    toast.success("Worker selected!");
    navigate(`/chat/${id}`);
  };

  const handleMarkComplete = async () => {
    await supabase.from("jobs").update({ status: "completed" }).eq("id", id);
    toast.success("Job marked complete!");
    navigate(`/rate/${id}`);
  };

  if (loading)
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </AppShell>
    );
  if (!job)
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">
          Job not found
        </div>
      </AppShell>
    );

  const isOwner = job.hirer_id === user?.id;
  const isAssignedOrCompleted =
    job.status === "assigned" || job.status === "completed";

  return (
    <AppShell
      header={
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="press">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-foreground truncate">{job.title}</h2>
        </div>
      }
    >
      <div className="px-4 py-4 space-y-4">
        <div className="border border-border rounded-2xl p-4 bg-card">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
            <span className="bg-success/10 text-success text-xs font-bold px-2.5 py-1 rounded-lg">
              ₹{job.pay_amount}
            </span>
          </div>
          {job.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {job.description}
            </p>
          )}
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>📍 {job.location_name}</span>
            <span>📅 {job.job_date}</span>
          </div>
          <div className="mt-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                job.status === "open"
                  ? "bg-primary/10 text-primary"
                  : job.status === "assigned"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-success/10 text-success"
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>

        {/* Message button for assigned/completed jobs */}
        {isAssignedOrCompleted && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/chat/${id}`)}
          >
            <MessageCircle size={18} /> Message
          </Button>
        )}

        {/* Worker: message button if applied */}
        {!isOwner && hasApplied && !isAssignedOrCompleted && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/chat/${id}`)}
          >
            <MessageCircle size={18} /> Message Hirer
          </Button>
        )}

        {isOwner && job.status === "assigned" && (
          <Button onClick={handleMarkComplete} className="w-full">
            <CheckCircle size={18} /> Mark Job Complete
          </Button>
        )}

        {isOwner && job.status === "completed" && (
          <div className="border border-border rounded-2xl p-6 text-center bg-card">
            <CheckCircle size={40} className="mx-auto text-success mb-2" />
            <h3 className="font-bold text-foreground">Job Completed!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pay worker using UPI or cash.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate(`/rate/${id}`)}
            >
              Rate Worker
            </Button>
          </div>
        )}

        {isOwner && applications.length > 0 && job.status === "open" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Applicants ({applications.length})
            </h3>
            {applications.map((app) => (
              <WorkerCard
                key={app.id}
                name={app.profiles?.full_name || "Worker"}
                skill={app.profiles?.skills?.[0] || ""}
                expectedPay={app.profiles?.expected_pay_per_day || 0}
                avatarUrl={app.profiles?.avatar_url || undefined}
                rating={app.profiles?.rating_avg}
                onChat={() => navigate(`/chat/${id}`)}
                onSelect={() => handleSelectWorker(app.id)}
              />
            ))}
          </div>
        )}

        {!isOwner && job.status === "open" && !hasApplied && (
          <Button
            className="w-full"
            onClick={async () => {
              if (!user) return;
              const { error } = await supabase.from("applications").insert({
                job_id: job.id,
                worker_id: user.id,
                status: "pending",
              });
              if (error) {
                toast.error(
                  error.code === "23505" ? "Already applied" : error.message,
                );
              } else {
                // Send auto-message to hirer
                const applicantName = profile?.full_name || "Someone";
                await supabase.from("messages").insert({
                  job_id: job.id,
                  sender_id: user.id,
                  content: `👋 ${applicantName} applied for "${job.title}"`,
                });
                toast.success("Applied!");
                setHasApplied(true);
              }
            }}
          >
            Apply for this Job
          </Button>
        )}

        {!isOwner && hasApplied && job.status === "open" && (
          <p className="text-center text-sm text-muted-foreground font-medium">
            ✅ You've applied for this job
          </p>
        )}
      </div>
    </AppShell>
  );
};

export default JobDetailPage;
