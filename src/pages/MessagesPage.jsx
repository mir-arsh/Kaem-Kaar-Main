import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { MessageCircle, ChevronRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    if (!user) return;

    const { data: messages, error } = await supabase
      .from("messages")
      .select(
        `
      job_id, 
      sender_id, 
      receiver_id, 
      content, 
      created_at, 
      jobs!messages_job_id_fkey(title)
    `,
      )
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading messages");
      setLoading(false);
      return;
    }

    if (messages) {
      const seen = new Map();
      for (const msg of messages) {
        // 1. Identify the "Other Person"
        const otherId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        // 2. SAFETY CHECK: Skip if data is corrupted or missing
        if (
          !otherId ||
          !msg.job_id ||
          otherId === "null" ||
          msg.job_id === "null"
        ) {
          console.warn("Skipping corrupted message thread:", msg);
          continue;
        }

        const threadKey = `${msg.job_id}_${otherId}`;

        if (!seen.has(threadKey)) {
          seen.set(threadKey, {
            job_id: msg.job_id,
            other_user_id: otherId,
            job_title: msg.jobs?.title || "Job Discussion",
            last_message: msg.content,
            last_at: msg.created_at,
          });
        }
      }
      setThreads(Array.from(seen.values()));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThreads();
  }, [user]);

  const handleDeleteThread = async (e, jobId, otherId) => {
    e.stopPropagation();

    if (!jobId || !otherId || jobId === "null" || otherId === "null") {
      console.error("Invalid IDs provided for deletion:", { jobId, otherId });
      toast.error("Error: Conversation data is missing.");
      return;
    }

    const { error, count } = await supabase
      .from("messages")
      .delete({ count: "exact" })
      .eq("job_id", jobId)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`,
      );

    if (error) {
      toast.error("Database error: " + error.message);
    } else {
      toast.success("Conversation deleted");
      setThreads((prev) =>
        prev.filter(
          (t) => !(t.job_id === jobId && t.other_user_id === otherId),
        ),
      );
    }
  };

  return (
    <AppShell header={<h2 className="font-bold text-foreground">Messages</h2>}>
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <MessageCircle size={48} className="mx-auto mb-4" />
            <p className="font-bold">No conversations yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {threads.map((t, i) => (
              <motion.div
                key={`${t.job_id}_${t.other_user_id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/chat/${t.job_id}/${t.other_user_id}`)}
                className="group relative w-full p-4 border border-border rounded-2xl bg-card text-left press hover:border-primary/40 transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">
                    {t.job_title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {t.last_message}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) =>
                      handleDeleteThread(e, t.job_id, t.other_user_id)
                    }
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
};

export default MessagesPage;
