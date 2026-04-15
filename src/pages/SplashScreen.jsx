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
      {/* Icon box */}
      <motion.div
        className="relative"
        initial={{ scale: 0.35, opacity: 0 }}
        animate={{ scale: [0.35, 1.08, 1], opacity: 1 }}
        transition={{
          duration: 0.55,
          delay: 0.15,
          times: [0, 0.75, 1],
          ease: "easeOut",
        }}
      >
        {isDark ? (
          // Dark mode: Chinar Red box with white-ish leaf SVG (Image 1)
          <div
            className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center"
            style={{ background: "hsl(4, 72%, 41%)" }}
          >
            <ChinarLeafIconDark />
          </div>
        ) : (
          // Light mode: Parchment box with favicon.png (Image 2)
          <div
            className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center"
            style={{ background: "hsl(38, 71%, 92%)" }}
          >
            <img
              src="/favicon.png"
              alt="Kaem Kaar"
              className="w-[58px] h-[58px] object-contain"
            />
          </div>
        )}

        {/* Saffron dot */}
        <motion.span
          className="absolute -top-1 -right-1 w-[9px] h-[9px] rounded-full"
          style={{ background: "hsl(37, 83%, 51%)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3, times: [0, 0.65, 1] }}
        />
      </motion.div>

      {/* Brand name */}
      <motion.p
        className="mt-5 text-center text-[26px] leading-[1.15] tracking-wide text-foreground"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.45, ease: "easeOut" }}
      >
        Kaem
        <br />
        Kaar
      </motion.p>

      {/* Tagline */}
      <motion.p
        className="mt-2.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.35, ease: "easeOut" }}
      >
        Kashmir's job marketplace
      </motion.p>

      {/* Loading bar */}
      <motion.div
        className="absolute bottom-10 w-[60px] h-[2.5px] rounded-full bg-muted overflow-hidden"
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

// Dark mode — white/parchment leaf on red box (Image 1)
function ChinarLeafIconDark() {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M27 4C27 4 22 10 16 10C10 10 7 15 8 20C5 21 3 24 5 27
           C3 29 4 33 7 34C6 38 8 42 12 43C13 47 17 50 21 49
           C23 51 27 52 27 52C27 52 31 51 33 49C37 50 41 47 42 43
           C46 42 48 38 47 34C50 33 51 29 49 27C51 24 49 21 46 20
           C47 15 44 10 38 10C32 10 27 4 27 4Z"
        fill="hsl(38, 71%, 93%)"
        fillOpacity="0.92"
      />
      <circle cx="27" cy="30" r="4.5" fill="hsl(37, 83%, 51%)" />
      <line
        x1="27"
        y1="34.5"
        x2="27"
        y2="50"
        stroke="hsl(38, 71%, 93%)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
