import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", classes: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-800" },
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          jobs (
            id,
            title,
            pay,
            location,
            profiles:hirer_id ( full_name )
          )
        `,
        )
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setApplications(data);
      setLoading(false);
    };

    fetchApplications();
  }, [user.id]);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  if (applications.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Briefcase size={32} className="opacity-30" />
        <p className="text-sm">You haven't applied to any jobs yet.</p>
      </div>
    );

  return (
    <div className="space-y-3 px-4 py-4">
      {applications.map((app, i) => {
        const status = statusConfig[app.status] ?? statusConfig.pending;
        const isAccepted = app.status === "accepted";

        return (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border rounded-2xl p-4 space-y-3 ${
              isAccepted ? "border-l-4 border-l-green-500" : "border-border"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {app.jobs?.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Posted by {app.jobs?.profiles?.full_name} ·{" "}
                  {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${status.classes}`}
              >
                {status.label}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {app.jobs?.pay && `PKR ${app.jobs.pay}`}
                {app.jobs?.location && ` · ${app.jobs.location}`}
              </span>
              {isAccepted && (
                <span className="text-xs font-bold text-green-600">
                  You got hired!
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MyApplications;
