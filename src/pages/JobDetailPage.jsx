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
  Send,
  Undo2,
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
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        <Marker position={[lat, lng]}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
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
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [userApplication, setUserApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isHirer = job?.hirer_id === user?.id;

  const fetchJobAndApplicants = async () => {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Hirer Side: Fetch all applications
      if (jobData?.hirer_id === user?.id) {
        const { data: appData } = await supabase
          .from("applications")
          .select(`id, worker_id, status, profiles:worker_id (full_name, avatar_url, rating_avg, skills)`)
          .eq("job_id", id);
        setApplicants(appData || []);
      } 
      
      // Worker Side: Fetch my application
      if (jobData?.hirer_id !== user?.id && user) {
        const { data: myAppData } = await supabase
          .from("applications")
          .select("*")
          .eq("job_id", id)
          .eq("worker_id", user.id)
          .maybeSingle();
        setUserApplication(myAppData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplicants();

    // REAL-TIME LISTENER: Updates Hirer's list if a Worker applies/undos
    const channel = supabase
      .channel(`job-updates-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications', filter: `job_id=eq.${id}` },
        () => fetchJobAndApplicants()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const handleApply = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert({ job_id: id, worker_id: user.id, status: "pending" })
        .select().single();

      if (error) throw error;
      
      await supabase.from("messages").insert({
        job_id: id, sender_id: user.id, receiver_id: job.hirer_id,
        content: `👋 ${profile?.full_name || "A worker"} applied for "${job.title}"`,
      });

      setUserApplication(data);
      toast.success("Applied!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setActionLoading(true);
    try {
      await supabase.from("applications").delete().eq("id", userApplication.id);
      setUserApplication(null);
      toast.success("Withdrawn");
    } catch (error) {
      toast.error("Error withdrawing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptWorker = async (workerId, workerName) => {
    setActionLoading(true);
    try {
      await supabase.from("applications").update({ status: "accepted" }).eq("job_id", id).eq("worker_id", workerId);
      await supabase.from("applications").delete().eq("job_id", id).neq("worker_id", workerId);
      const { data: updatedJob } = await supabase.from("jobs").update({ status: "in_progress" }).eq("id", id).select().single();

      setJob(updatedJob);
      toast.success(`Hired ${workerName}!`);
    } catch (error) {
      toast.error("Error hiring");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJobStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const { data: updatedJob } = await supabase.from("jobs").update({ status: newStatus }).eq("id", id).select().single();
      setJob(updatedJob);
      if (newStatus === "completed") navigate(`/rate/${id}`);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <AppShell header={<h2 className="font-bold">Job Portal</h2>}>
      <div className="px-4 py-6 space-y-6 pb-24">
        
        {/* JOB INFO CARD */}
        <section className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-5">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-black tracking-tighter leading-tight">{job?.title}</h1>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${job?.status === "open" ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20"}`}>
              {job?.status}
            </div>
          </div>
          <p className="text-muted-foreground text-sm">"{job?.description}"</p>
          <div className="flex gap-6 pt-4 border-t border-border/50 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={16} className="text-primary" /> {job?.location_name}</div>
            <div className="text-foreground bg-primary/10 px-3 py-1 rounded-lg">₹{job?.pay_amount}</div>
          </div>
          {job?.latitude && job?.longitude && <JobLocationMap lat={job.latitude} lng={job.longitude} title={job.title} />}
        </section>

        {/* HIRER VIEW */}
        {isHirer && (
          <div className="space-y-4">
            {job?.status === "open" ? (
              <>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Current Applicants ({applicants.length})</h3>
                <AnimatePresence>
                  {applicants.map((app) => (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">{app.profiles?.full_name?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{app.profiles?.full_name}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1">
                          <Star size={10} className="text-yellow-500" fill="currentColor" /> {app.profiles?.rating_avg || "5.0"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="rounded-xl" onClick={() => navigate(`/chat/${id}/${app.worker_id}`)}><MessageCircle size={18} /></Button>
                        <Button size="sm" className="bg-success text-white rounded-xl" onClick={() => handleAcceptWorker(app.worker_id, app.profiles?.full_name)} disabled={actionLoading}>Hire</Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            ) : job?.status === "in_progress" && (
              <div className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[2.5rem] text-center space-y-4">
                <CheckCircle2 className="text-primary mx-auto" size={32} />
                <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black" onClick={() => handleUpdateJobStatus("completed")} disabled={actionLoading}>MARK COMPLETED</Button>
              </div>
            )}
          </div>
        )}

        {/* WORKER VIEW */}
        {!isHirer && (
          <div className="space-y-4">
            {job?.status === "in_progress" ? (
              <div className="bg-muted/50 p-8 rounded-[2rem] text-center border-border">
                <p className="font-black text-lg">Work Started! 🎉</p>
                <Button variant="link" onClick={() => navigate(`/chat/${id}/${user.id}`)}>Chat with Employer</Button>
              </div>
            ) : job?.status === "open" ? (
              userApplication ? (
                <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-4">
                  <p className="font-bold text-sm text-center">Applied & Pending</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl text-destructive" onClick={handleWithdraw} disabled={actionLoading}><Undo2 size={18} className="mr-2" /> Undo</Button>
                    <Button className="flex-1 rounded-xl" onClick={() => navigate(`/chat/${id}/${user.id}`)}><MessageCircle size={18} className="mr-2" /> Chat</Button>
                  </div>
                </div>
              ) : (
                <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl" onClick={handleApply} disabled={actionLoading}>
                   {actionLoading ? <Loader2 className="animate-spin" /> : <>APPLY NOW <Send size={20} className="ml-2" /></>}
                </Button>
              )
            ) : (
              <p className="text-center text-muted-foreground py-10">Applications closed.</p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default JobDetailPage;