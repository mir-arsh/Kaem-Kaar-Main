import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";

const SKILLS = [
  "Plumber",
  "Electrician",
  "Painter",
  "Carpenter",
  "Cleaner",
  "Driver",
  "Cook",
  "Helper",
  "Mason",
  "Gardener",
  "Other",
];

const PostAvailabilityPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(profile?.skills?.[0] || "");
  const [location, setLocation] = useState(profile?.location_name || "");
  const [pay, setPay] = useState(
    profile?.expected_pay_per_day?.toString() || "",
  );
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    /* FUTURE_FEATURE: Reactivate when allowing workers to post availability
  if (!skill || !location || !pay) {
    toast.error("Please fill all required fields");
    return;
  }
  if (!user) return;
  setLoading(true);

  const { error } = await supabase.from("worker_availability").insert({
    worker_id: user.id,
    skill,
    location_name: location,
    pay_per_day: Number(pay),
    available_date: date || null,
    note: note || null,
    is_active: true,
  });

  setLoading(false);
  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Availability posted!");
    navigate("/jobs");
  }
  */
    toast.info("This feature is currently under maintenance.");
  };

  return (
    <AppShell
      header={<h2 className="font-bold text-foreground">Post Availability</h2>}
    >
      <div className="px-4 py-6 space-y-5">
        <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-primary">
            Let hirers know you're available for work. They'll be able to see
            your profile and contact you.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Your Skill
          </label>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full h-14 rounded-xl border border-input bg-card px-4 text-base font-medium text-foreground"
          >
            <option value="">Select a skill</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Location
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="City or area"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Expected Pay / Day (₹)
          </label>
          <Input
            type="number"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Available From (optional)
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Note (optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl min-h-[80px]"
            placeholder="e.g. 5 years experience, have own tools..."
          />
        </div>

        <Button onClick={handlePost} disabled={loading} className="w-full">
          {loading ? "Posting..." : "Post Availability"}
          <ArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );
};

export default PostAvailabilityPage;
