
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { getCurrentUser, signOut, AuthUser } from "./services/authService";
import LoginForm from "./components/LoginForm";

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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
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
              <Link to="/">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Registration
                </button>
              </Link>
              <Link to="/admin">
                <button className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Admin
                </button>
              </Link>
              {user && (
                <button 
                  onClick={() => logout()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              )}
            </div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={
                user ? <Navigate to="/admin" replace /> : <LoginForm onLoginSuccess={() => window.location.href = "/admin"} />
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
