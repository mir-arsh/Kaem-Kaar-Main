import { MapPin, Calendar, ArrowRight, CheckCircle } from "lucide-react";

const JobCard = ({ title, location, pay, date, status, onApply, onView }) => {
  const isApplied = status === "applied";

  return (
    <div
      className="p-4 border border-border rounded-2xl bg-card press cursor-pointer hover:border-primary/30 transition-colors"
      onClick={onView}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-bold leading-snug text-foreground flex-1 pr-3">
          {title}
        </h3>
        <span className="bg-success/10 text-success text-sm font-extrabold px-3 py-1.5 rounded-xl shrink-0">
          ₹{pay}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
          <MapPin size={12} /> {location}
        </span>
        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
          <Calendar size={12} /> {date}
        </span>
      </div>
      {isApplied ? (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-success py-2">
          <CheckCircle size={16} /> Applied
        </div>
      ) : onApply ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
          className="mt-4 w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl active:scale-[0.97] transition-all text-sm flex items-center justify-center gap-2"
        >
          Apply Now
          <ArrowRight size={16} />
        </button>
      ) : (
        <div className="mt-3 flex items-center justify-end text-xs font-bold text-primary">
          View details <ArrowRight size={14} className="ml-1" />
        </div>
      )}
    </div>
  );
};

export default JobCard;
