import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import JobFeedPage from "./pages/JobFeedPage";
import PostJobPage from "./pages/PostJobPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import JobDetailPage from "./pages/JobDetailPage";
import ChatPage from "./pages/ChatPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import WorkerProfileSetup from "./pages/WorkerProfileSetup";
import RatingPage from "./pages/RatingPage";
import LoginPage from "./pages/LoginPage";
import AIChatbotPage from "./pages/AIChatbotPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowNoRole = false }) => {
  const { user, profile, loading, profileLoaded } = useAuth();

  if (loading)
    return (
      <div className="min-h-svh flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!profileLoaded)
    return (
      <div className="min-h-svh flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );

  if (!allowNoRole && (!profile?.full_name || !profile?.role)) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-svh flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <AuthRoute>
                    <LoginPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <JobFeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute>
                    <JobDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <ProtectedRoute>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:jobId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistant"
                element={
                  <ProtectedRoute>
                    <AIChatbotPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/setup"
                element={
                  <ProtectedRoute allowNoRole>
                    <WorkerProfileSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rate/:jobId"
                element={
                  <ProtectedRoute>
                    <RatingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/role-selection"
                element={
                  <ProtectedRoute>
                    <RoleSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
