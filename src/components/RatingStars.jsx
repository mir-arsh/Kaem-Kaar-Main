import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const RatingStars = ({ rating, onRate, size = 28 }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate?.(star)}
          disabled={!onRate}
          className={cn("press", onRate && "cursor-pointer")}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors duration-150",
              star <= rating
                ? "fill-primary text-primary"
                : "fill-none text-border",
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
