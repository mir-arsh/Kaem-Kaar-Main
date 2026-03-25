import { MapPin, Calendar, Star, ArrowRight, Wrench } from "lucide-react";

const WorkerCard = ({
  name,
  skill,
  location,
  pay,
  date,
  rating,
  avatarUrl,
  onContact,
}) => {
  return (
    <div className="p-4 border border-border rounded-2xl bg-card hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-extrabold text-primary">
              {name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground truncate">
              {name}
            </h3>
            <span className="bg-success/10 text-success text-sm font-extrabold px-3 py-1.5 rounded-xl shrink-0 ml-2">
              ₹{pay}/day
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
              <Wrench size={10} /> {skill}
            </span>
            {rating > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <Star size={10} className="fill-primary text-primary" />{" "}
                {rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
          <MapPin size={12} /> {location}
        </span>
        {date && (
          <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
            <Calendar size={12} /> {date}
          </span>
        )}
      </div>

      {onContact && (
        <button
          onClick={onContact}
          className="mt-4 w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl active:scale-[0.97] transition-all text-sm flex items-center justify-center gap-2"
        >
          Contact Worker
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};

export default WorkerCard;
