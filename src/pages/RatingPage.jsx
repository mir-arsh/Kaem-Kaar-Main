import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RatingStars from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";

const RatingPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!user || !jobId) return;
    setLoading(true);

    // Get the other user from the job
    const { data: job } = await supabase
      .from("jobs")
      .select("hirer_id")
      .eq("id", jobId)
      .maybeSingle();
    const { data: app } = await supabase
      .from("applications")
      .select("worker_id")
      .eq("job_id", jobId)
      .eq("status", "accepted")
      .maybeSingle();

    const ratedUserId =
      user.id === job?.hirer_id ? app?.worker_id : job?.hirer_id;

    if (!ratedUserId) {
      toast.error("Could not find user to rate");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("ratings").insert({
      rater_id: user.id,
      rated_user_id: ratedUserId,
      job_id: jobId,
      score: rating,
    });

    setLoading(false);
    if (error) {
      toast.error(error.code === "23505" ? "Already rated" : error.message);
    } else {
      toast.success("Rating submitted!");
      navigate("/");
    }
  };

  return (
    <AppShell showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <h1 className="text-2xl font-extrabold text-foreground mb-2">
          Rate your experience
        </h1>
        <p className="text-muted-foreground font-medium mb-8">
          How was working together?
        </p>
        <RatingStars rating={rating} onRate={setRating} size={40} />
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </Button>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-muted-foreground font-medium press"
        >
          Skip for now
        </button>
      </div>
    </AppShell>
  );
};

export default RatingPage;
