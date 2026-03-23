import { forwardRef } from "react";
import { Home, Briefcase, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = forwardRef((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-[480px] mx-auto flex h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 press relative",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
