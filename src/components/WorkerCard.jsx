import { Star } from "lucide-react";
import { Button } from "./ui/button";

const WorkerCard = ({
  name,
  skill,
  expectedPay,
  avatarUrl,
  rating,
  onChat,
  onSelect,
}) => {
  return (
    <div className="p-4 border border-border rounded-2xl bg-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {name[0]}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{name}</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {skill}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-foreground">
            ₹{expectedPay}/day
          </span>
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-0.5 justify-end mt-0.5">
              <Star size={12} className="fill-primary text-primary" />
              <span className="text-xs font-bold text-muted-foreground">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {onChat && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onChat}
          >
            Start Chat
          </Button>
        )}
        {onSelect && (
          <Button size="sm" className="flex-1" onClick={onSelect}>
            Select Worker
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkerCard;
