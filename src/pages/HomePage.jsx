import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppShell from "@/components/AppShell";
import {
  Wrench,
  Plus,
  ArrowRight,
  Search,
  BookOpen,
  ChefHat,
  Truck,
  MapPin,
  Briefcase,
  LayoutGrid,
  Home,
  Hammer,
  MoreHorizontal,
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "repair", label: "Repair", icon: Wrench },
  { id: "homehelp", label: "Home Help", icon: Home },
  { id: "cooking", label: "Cook", icon: ChefHat },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "education", label: "Tutor", icon: BookOpen },
  { id: "labor", label: "Labor", icon: Hammer },
  { id: "other", label: "Other", icon: MoreHorizontal }
];

const HomePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isHirer = profile?.role === "hirer";
  
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  // PERFORMANCE: Fetch jobs based on category and search directly from Supabase
  const fetchJobs = async (category, search) => {
    try {
      setLoading(true);
      let query = supabase
        .from("jobs")
        .select(`
          id, title, description, location_name, pay_amount, category, status,
          profiles:hirer_id ( full_name )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20); // Speed: Limit initial results

      // Database-side filtering (much faster than client-side)
      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (search.trim()) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on category change or search (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchJobs(activeCategoryId, searchQuery);
    }, 400); // 400ms Debounce

    return () => clearTimeout(handler);
  }, [activeCategoryId, searchQuery]);

  return (
    <AppShell header={null}>
      <div className="flex flex-col min-h-full">
        {/* Dark Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative px-5 pt-4 pb-16 overflow-hidden bg-[hsl(25,90%,10%)]"
        >
          <div className="relative flex items-center justify-between mb-6">
            <h1 className="text-lg font-extrabold tracking-tight text-[hsl(38,71%,93%)]">Kaem Kaar</h1>
            <button 
              onClick={() => navigate("/profile")} 
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 bg-white/15 overflow-hidden text-white font-bold"
            >
               {profile?.full_name?.[0]?.toUpperCase() || "?"}
            </button>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[hsl(38,71%,68%)]">
            Salam, {firstName.toUpperCase()}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight mb-5 text-[hsl(38,71%,93%)] whitespace-pre-line">
            {isHirer ? "Manage your posts\n& find workers" : "Find skilled help\nnear you today"}
          </h2>

          <div className="relative">
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-[hsl(38,40%,93%)] shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/30">
              <Search size={18} className="text-[hsl(25,30%,50%)]" />
              <input
                className="flex-1 bg-transparent text-sm font-medium outline-none text-[hsl(25,90%,8%)] placeholder:text-[hsl(25,20%,50%)]"
                placeholder="Try 'plumber' or 'lal chowk'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <X size={14} className="text-[hsl(25,30%,40%)]" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 rounded-t-3xl -mt-4 px-5 pt-6 pb-24 space-y-6 bg-background">
          
          {/* Categories Strip */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">Categories</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`press flex-shrink-0 flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 min-w-[72px] border transition-all ${
                    activeCategoryId === cat.id 
                    ? "bg-[#A32A1D] text-white border-[#A32A1D] shadow-md" 
                    : "bg-[#F5E6D3] text-[#4A3728] border-transparent"
                  }`}
                >
                  <cat.icon size={20} />
                  <span className="text-[11px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {searchQuery ? `Search results` : activeCategoryId === 'all' ? 'Latest Jobs' : `${activeCategoryId} Jobs`}
              </p>
              {!searchQuery && (
                <button onClick={() => navigate("/jobs")} className="text-xs font-bold text-primary">See all →</button>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 w-full bg-muted/40 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {jobs.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20"
                    >
                      <Search className="mx-auto mb-3 opacity-20" size={40} />
                      <p className="text-sm font-bold text-muted-foreground">No matches found</p>
                    </motion.div>
                  ) : (
                    jobs.map((job) => (
                      <motion.div
                        layout
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="press rounded-2xl p-4 bg-card border border-border shadow-sm cursor-pointer"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                            <Briefcase size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-sm leading-tight truncate">{job.title}</span>
                              <span className="text-xs font-bold text-primary">₹{job.pay_amount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground font-medium">
                              <MapPin size={12} className="text-primary" />
                              <span>{job.location_name}</span>
                              <span>•</span>
                              <span className="truncate">{job.profiles?.full_name}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>

          {isHirer && (
            <button
              onClick={() => navigate("/post-job")}
              className="press w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/15"><Plus size={18} /></div>
                Post a New Job
              </div>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default HomePage;