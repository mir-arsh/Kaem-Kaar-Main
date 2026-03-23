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

const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [pay, setPay] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title || !location || !pay || !date) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("jobs").insert({
      hirer_id: user.id,
      title,
      description,
      location_name: location,
      pay_amount: Number(pay),
      job_date: date,
      status: "open",
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Job posted!");
      navigate("/");
    }
  };

  return (
    <AppShell
      header={<h2 className="font-bold text-foreground">Post a Job</h2>}
    >
      <div className="px-4 py-6 space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Job Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="e.g. Need a plumber"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl min-h-[100px]"
            placeholder="What needs to be done?"
          />
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
            Date
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
            Pay Offered (₹)
          </label>
          <Input
            type="number"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="500"
          />
        </div>

        <Button onClick={handlePost} disabled={loading} className="w-full">
          {loading ? "Posting..." : "Post Job"}
          <ArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );
};

export default PostJobPage;
