import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, Loader2, Award, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const RatingPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchRatingContext = async () => {
      setLoading(true);
      try {
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select(
            `
            *,
            applications(worker_id, status)
          `,
          )
          .eq("id", jobId)
          .eq("applications.status", "accepted")
          .single();

        if (jobError) throw jobError;
        setJob(jobData);

        const targetId = jobData.applications[0]?.worker_id;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", targetId)
          .single();

        setTargetUser({ ...profileData, id: targetId });
      } catch (error) {
        console.error(error);
        toast.error("Could not load rating details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRatingContext();
  }, [jobId, user.id]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setSubmitting(true);
    try {
      const { error: reviewError } = await supabase.from("reviews").insert({
        job_id: jobId,
        rater_id: user.id,
        receiver_id: targetUser.id,
        rating: rating,
        comment: comment.trim(),
      });

      if (reviewError) throw reviewError;

      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("receiver_id", targetUser.id);

      const totalRating = allReviews.reduce(
        (acc, curr) => acc + curr.rating,
        0,
      );
      const avgRating = totalRating / allReviews.length;

      await supabase
        .from("profiles")
        .update({ rating_avg: avgRating })
        .eq("id", targetUser.id);

      toast.success(`Review for ${targetUser.full_name} submitted!`);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <AppShell header={<h2 className="font-bold">Rating & Review</h2>}>
      <div className="px-6 py-10 max-w-md mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner overflow-hidden border-2 border-primary/20">
            {targetUser?.avatar_url ? (
              <img
                src={targetUser.avatar_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Rate Experience
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              How was your experience with{" "}
              <span className="text-foreground font-bold">
                {targetUser?.full_name}
              </span>
              ?
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-all transform active:scale-75"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={40}
                  className={`transition-colors ${
                    star <= (hover || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted border-muted"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {rating === 1 && "Terrible"}
            {rating === 2 && "Poor"}
            {rating === 3 && "Good"}
            {rating === 4 && "Great"}
            {rating === 5 && "Amazing"}
          </span>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Write a comment
          </label>
          <Textarea
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] rounded-3xl bg-muted/30 border-none focus-visible:ring-primary/20 p-5 text-sm"
          />
        </div>

        <Button
          className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 press"
          disabled={submitting || rating === 0}
          onClick={handleSubmitReview}
        >
          {submitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              Submit Review <Send size={18} className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </AppShell>
  );
};

export default RatingPage;
