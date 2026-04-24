import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export default function SplashScreen({ onFinish }) {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      


      <motion.p
        className="mt-7 text-center text-[36px] leading-[1.2] tracking-wide text-foreground"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.45, ease: "easeOut" }}
      >
        Kaem
        <br />
        Kaar
      </motion.p>

      <motion.p
        className="mt-3 text-[12px] tracking-[0.18em] uppercase text-muted-foreground"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.35, ease: "easeOut" }}
      >
        Kashmir's job marketplace
      </motion.p>

      <motion.div
        className="absolute bottom-10 w-[80px] h-[3px] rounded-full bg-muted overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "hsl(4, 72%, 41%)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.4, duration: 1.6, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}