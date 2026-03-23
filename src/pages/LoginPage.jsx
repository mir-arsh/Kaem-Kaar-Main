import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Hammer } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-svh bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-6">
            <Hammer size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Kaem Kaar
          </h1>
          <p className="text-muted-foreground font-medium mt-2 text-base">
            Find work nearby. Get paid today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl text-base bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-xl text-base bg-card"
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
          </div>
          <Button
            onClick={handleAuth}
            disabled={loading}
            className="w-full h-14 rounded-xl text-base font-bold"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
            <ArrowRight size={18} />
          </Button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-muted-foreground font-medium pt-2 hover:text-foreground transition-colors"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </motion.div>
      </div>

      {/* Bottom decoration */}
      <div className="h-2 bg-primary/20 rounded-t-full mx-8 mb-0" />
    </div>
  );
};

export default LoginPage;
