import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { MessageCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!user) return;

      // Get all jobs where user is hirer
      const { data: hirerJobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("hirer_id", user.id);

      // Get all jobs where user has applied
      const { data: workerApps } = await supabase
        .from("applications")
        .select("job_id")
        .eq("worker_id", user.id);

      const jobIds = new Set();
      hirerJobs?.forEach((j) => jobIds.add(j.id));
      workerApps?.forEach((a) => jobIds.add(a.job_id));

      if (jobIds.size === 0) {
        setLoading(false);
        return;
      }

      const { data: messages } = await supabase
        .from("messages")
        .select("job_id, content, created_at, jobs!messages_job_id_fkey(title)")
        .in("job_id", Array.from(jobIds))
        .order("created_at", { ascending: false });

      if (messages) {
        const seen = new Map();
        for (const msg of messages) {
          if (!seen.has(msg.job_id)) {
            seen.set(msg.job_id, {
              job_id: msg.job_id,
              job_title: msg.jobs?.title || "Job",
              last_message: msg.content,
              last_at: msg.created_at || "",
            });
          }
        }
        setThreads(Array.from(seen.values()));
      }
      setLoading(false);
    };
    fetchThreads();
  }, [user]);

  return (
    <AppShell header={<h2 className="font-bold text-foreground">Messages</h2>}>
      <div className="px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border border-border rounded-2xl bg-card"
              >
                <div className="h-4 w-32 skeleton-shimmer rounded-lg mb-2" />
                <div className="h-3 w-48 skeleton-shimmer rounded-lg" />
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={28} className="text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-bold text-sm">
              No messages yet
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Messages will appear when you apply to jobs
            </p>
          </motion.div>
        ) : (
          threads.map((t, i) => (
            <motion.button
              key={t.job_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/chat/${t.job_id}`)}
              className="w-full p-4 border border-border rounded-2xl bg-card text-left press hover:border-primary/30 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm">
                  {t.job_title}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {t.last_message}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground shrink-0"
              />
            </motion.button>
          ))
        )}
      </div>
    </AppShell>
  );
};

export default MessagesPage;
