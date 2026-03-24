import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Hammer } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("OTP sent to your email!");
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtp();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-svh bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* Header */}
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

        <AnimatePresence mode="wait">
          {/* Step 1 — Email */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
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
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="h-14 rounded-xl text-base bg-card"
                />
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-14 rounded-xl text-base font-bold"
              >
                {loading ? "Sending..." : "Send Code"}
                <ArrowRight size={18} />
              </Button>
              <p className="text-center text-sm text-muted-foreground pt-1">
                We'll send a 6-digit code to your email
              </p>
            </motion.div>
          )}

          {/* Step 2 — OTP */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Enter Code
                </label>
                <p className="text-sm text-muted-foreground">
                  Sent to{" "}
                  <span className="text-foreground font-semibold">{email}</span>
                </p>
              </div>

              {/* OTP Boxes */}
              <div
                className="flex gap-2 justify-between"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-full aspect-square max-w-[64px] text-center text-2xl font-bold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-14 rounded-xl text-base font-bold"
              >
                {loading ? "Verifying..." : "Verify & Login"}
                <ArrowRight size={18} />
              </Button>

              <button
                onClick={() => {
                  setStep("email");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="w-full text-sm text-muted-foreground font-medium pt-1 hover:text-foreground transition-colors"
              >
                ← Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-2 bg-primary/20 rounded-t-full mx-8 mb-0" />
    </div>
  );
};

export default LoginPage;
