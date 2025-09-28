
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ExitPage from "./pages/ExitPage";
import NavBar from "./components/NavBar";
import { getCurrentUser, signOut, AuthUser } from "./services/authService";

const queryClient = new QueryClient();

// Create auth context
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    console.log("Refreshing authentication...");
    const { user } = await getCurrentUser();
    console.log("Auth refresh result:", user);
    setUser(user);
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      const { user } = await getCurrentUser();
      console.log("Auth check result:", user);
      setUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    console.log("Logging out...");
    await signOut();
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, isLoading, logout, refreshAuth }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <NavBar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/exit" element={<ExitPage />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                  path="/admin-dashboard"
                  element={
                    user && user.role === "admin" ? (
                      <AdminDashboard />
                    ) : isLoading ? (
                      <div className="flex justify-center items-center min-h-screen">Loading...</div>
                    ) : (
                      <Navigate to="/admin-login" replace />
                    )
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
