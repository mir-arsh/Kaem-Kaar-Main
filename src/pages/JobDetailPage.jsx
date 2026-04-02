import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Trash2,
  Star,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const JobLocationMap = ({ lat, lng, title }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
      <MapPin size={12} className="text-primary" /> Job Location
    </label>
    <div className="h-48 w-full rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
    >
      <MapPin size={11} /> Open in Google Maps
    </a>
  </div>
);

const JobDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isHirer = job?.hirer_id === user?.id;

  useEffect(() => {
    fetchJobAndApplicants();
  }, [id, user]);

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    try {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      if (jobData?.hirer_id === user?.id) {
        const { data: appData } = await supabase
          .from("applications")
          .select(
            `
            id,
            worker_id,
            status,
            profiles:worker_id (
              full_name,
              avatar_url,
              rating_avg,
              skills
            )
          `,
          )
          .eq("job_id", id);
        setApplicants(appData || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWorker = async (workerId, workerName) => {
    setActionLoading(true);
    try {
      await supabase
        .from("applications")
        .update({ status: "accepted" })
        .eq("job_id", id)
        .eq("worker_id", workerId);

      await supabase
        .from("applications")
        .delete()
        .eq("job_id", id)
        .neq("worker_id", workerId);

      const { data: updatedJob, error: jobError } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", id)
        .select()
        .single();

      if (jobError) throw jobError;

      setJob(updatedJob);
      setApplicants([]);

      await supabase.from("messages").insert({
        job_id: id,
        sender_id: user.id,
        receiver_id: workerId,
        content: `🎊 Agreement Started! I have accepted you for the job: "${updatedJob.title}". Let's get started!`,
      });

      toast.success(`Hired ${workerName}!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to hire worker. Check RLS policies.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJobStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const { data: updatedJob, error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setJob(updatedJob);

      toast.success(`Job marked as ${newStatus}`);

      if (newStatus === "completed") {
        navigate(`/rate/${id}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveApplicant = async (appId) => {
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", appId);

    if (error) {
      toast.error("Error removing applicant");
    } else {
      setApplicants((prev) => prev.filter((a) => a.id !== appId));
      toast.success("Applicant removed");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <AppShell header={<h2 className="font-bold">Job Command Center</h2>}>
      <div className="px-4 py-6 space-y-6">
        {/* ── JOB INFO SECTION ── */}
        <section className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-5">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-black tracking-tighter leading-tight">
              {job?.title}
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                job?.status === "open"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              {job?.status}
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed italic">
            "{job?.description}"
          </p>

          <div className="flex gap-6 pt-4 border-t border-border/50 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={16} className="text-primary" /> {job?.location_name}
            </div>
            <div className="text-foreground bg-primary/10 px-3 py-1 rounded-lg">
              ₹{job?.pay_amount}
            </div>
          </div>

          {/* Map — only render if coordinates exist */}
          {job?.latitude && job?.longitude ? (
            <JobLocationMap
              lat={job.latitude}
              lng={job.longitude}
              title={job.title}
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
              <MapPin size={13} />
              No exact location pinned for this job.
            </div>
          )}
        </section>

        {/* ── HIRER VIEWS ── */}
        {isHirer && (
          <div className="space-y-4">
            {job?.status === "open" && (
              <>
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Applicants ({applicants.length})
                  </h3>
                </div>
                <AnimatePresence mode="popLayout">
                  {applicants.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted-foreground italic text-center py-10 bg-muted/30 rounded-2xl"
                    >
                      No applications yet. Hang tight!
                    </motion.p>
                  ) : (
                    applicants.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4"
                      >
                        <img
                          src={app.profiles?.avatar_url || "/placeholder.svg"}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-background shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">
                            {app.profiles?.full_name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1">
                            <span className="flex items-center gap-0.5 text-yellow-500">
                              <Star size={10} fill="currentColor" />{" "}
                              {app.profiles?.rating_avg?.toFixed(1) || "New"}
                            </span>
                            <span>•</span>
                            <span className="uppercase text-primary">
                              {app.profiles?.skills?.[0] || "Worker"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-xl h-11 w-11"
                            onClick={() =>
                              navigate(`/chat/${id}/${app.worker_id}`)
                            }
                          >
                            <MessageCircle size={20} />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-white rounded-xl font-bold h-11 px-4"
                            disabled={actionLoading}
                            onClick={() =>
                              handleAcceptWorker(
                                app.worker_id,
                                app.profiles?.full_name,
                              )
                            }
                          >
                            Hire
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive h-11 w-11"
                            onClick={() => handleRemoveApplicant(app.id)}
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </>
            )}

            {job?.status === "in_progress" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[2.5rem] space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="text-primary" size={32} />
                  </div>
                  <h3 className="font-black text-xl tracking-tight">
                    Active Work Agreement
                  </h3>
                  <p className="text-xs text-muted-foreground px-6 leading-relaxed">
                    You have an active worker. Once they finish the physical
                    task, mark the job as complete to release the rating.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 press"
                    disabled={actionLoading}
                    onClick={() => handleUpdateJobStatus("completed")}
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "JOB COMPLETED ✅"
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-14 rounded-2xl border-border bg-card font-bold text-xs uppercase tracking-widest"
                      onClick={() => toast.info("Contract terms are active.")}
                    >
                      <FileText size={18} className="mr-2 text-primary" />
                      Agreement
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 rounded-2xl border-destructive/10 text-destructive bg-destructive/5 font-bold text-xs uppercase tracking-widest press"
                      disabled={actionLoading}
                      onClick={() => handleUpdateJobStatus("open")}
                    >
                      <XCircle size={18} className="mr-2" /> Cancel Hire
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── WORKER VIEW ── */}
        {!isHirer && (
          <div className="py-4">
            {job?.status === "in_progress" ? (
              <div className="bg-muted/50 p-8 rounded-[2rem] text-center border-2 border-dashed border-border">
                <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-black text-lg tracking-tight">
                  You're Hired!
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">
                  Complete the work then ask the employer to mark it as done.
                </p>
                <Button
                  variant="link"
                  className="mt-4 text-primary font-bold"
                  onClick={() => navigate(`/chat/${id}/${user.id}`)}
                >
                  Chat with Employer
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                View job details or contact the employer in the chat.
              </p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default JobDetailPage;
