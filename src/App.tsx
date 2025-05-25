import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import { getCurrentUser, signOut, AuthUser } from "./services/authService";

const queryClient = new QueryClient();

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
            {/* ---- TOP RIGHT BUTTONS ---- */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
              <Link
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Register
              </Link>
              <Link
                to="/admin-login"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Admin
              </Link>
            </div>
            {/* ---- ROUTES ---- */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin-dashboard"
                element={
                  user && user.role === "admin" ? (
                    <AdminDashboard />
                  ) : (
                    <Navigate to="/admin-login" replace />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
