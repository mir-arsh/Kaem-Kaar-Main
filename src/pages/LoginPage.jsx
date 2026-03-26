import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        toast.success("Account created! Welcome.");
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Logged in successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter italic text-primary">
            KAEM KAAR
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {isSignUp ? "Create your account" : "Welcome back, chief"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User
                className="absolute left-4 top-4 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 pl-12 rounded-2xl bg-muted/50 border-none"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail
              className="absolute left-4 top-4 text-muted-foreground"
              size={18}
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-muted/50 border-none"
              required
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-4 text-muted-foreground"
              size={18}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-muted/50 border-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
