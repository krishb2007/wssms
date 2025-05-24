import LoginForm from "@/components/LoginForm";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";   // <-- Add this import
import { getCurrentUser, signOut, AuthUser } from "./services/authService";

const queryClient = new QueryClient();

// Create auth context
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, isLoading, logout }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="fixed top-4 right-4 z-50 flex gap-2">
              {/* Admin button: only show if user is admin */}
              {user && user.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Admin
                </Link>
              )}
              {/* Logout: only show if user is logged in */}
              {user && (
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Logout
                </button>
              )}
            </div>
            {isLoading ? (
              <div>Loading...</div>
            ) : !user ? (
              <div className="flex justify-center items-center min-h-screen">
                <LoginForm />
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Index />} />
                {/* Protected Admin Route */}
                <Route
                  path="/admin-dashboard"
                  element={
                    user && user.role === "admin" ? (
                      <AdminDashboard />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
