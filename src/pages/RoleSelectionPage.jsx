import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Wrench } from "lucide-react";
import { toast } from "sonner";

const RoleSelectionPage = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const selectRole = async (role) => {
    await setRole(role);
    toast.success(
      `Switched to ${role === "worker" ? "Find Work" : "Hire Worker"} mode`,
    );
    navigate("/");
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-svh bg-background flex flex-col justify-center px-6">
      <div className="mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          What do you want to do?
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          You can switch roles anytime.
        </p>
      </div>
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-20 flex items-center justify-start gap-4 text-left"
          onClick={() => selectRole("worker")}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench size={24} className="text-primary" />
          </div>
          <div>
            <div className="font-bold text-base text-foreground">Find Work</div>
            <div className="text-sm text-muted-foreground font-medium">
              Browse and apply for nearby jobs
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full h-20 flex items-center justify-start gap-4 text-left"
          onClick={() => selectRole("hirer")}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase size={24} className="text-primary" />
          </div>
          <div>
            <div className="font-bold text-base text-foreground">
              Hire Worker
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Post jobs and find workers
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
