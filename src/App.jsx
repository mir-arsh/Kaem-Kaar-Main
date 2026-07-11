import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

import HomePage from "./pages/HomePage";
import JobFeedPage from "./pages/JobFeedPage";
import PostJobPage from "./pages/PostJobPage";
import JobDetailPage from "./pages/JobDetailPage";
import ChatPage from "./pages/ChatPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import WorkerProfileSetup from "./pages/WorkerProfileSetup";
import LoginPage from "./pages/LoginPage";
import AIChatbotPage from "./pages/AIChatbotPage";
import SplashScreen from "./pages/SplashScreen";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading, profile, profileLoaded } = useAuth();
  const location = useLocation();

  if (loading || (user && !profileLoaded)) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (profileLoaded && !profile?.role && location.pathname !== "/profile/setup") {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Sonner position="top-center" />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobFeedPage /></ProtectedRoute>} />
                <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
                <Route path="/post-job" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
                <Route path="/chat/:jobId/:workerId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                {/* <Route path="/assistant" element={<ProtectedRoute><AIChatbotPage /></ProtectedRoute>} /> */}
                {/* Fixing RB  */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/profile/setup" element={<ProtectedRoute><WorkerProfileSetup /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
