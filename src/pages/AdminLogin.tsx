
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../services/authService';
import { useAuth } from '../App';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log("User already logged in as admin, redirecting...");
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    console.log("Form submitted with:", { email, password: "***", isSignUp });

    try {
      const { user: authUser, error } = isSignUp 
        ? await signUp({ email, password })
        : await signIn({ email, password });

      console.log("Auth result:", { user: authUser, error });

      if (error || !authUser) {
        console.error("Auth failed:", error);
        toast({
          title: isSignUp ? "Sign Up Failed" : "Login Failed",
          description: error || "Invalid credentials",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("User role:", authUser.role);

      if (authUser.role !== 'admin') {
        console.error("User is not admin:", authUser.role);
        toast({
          title: "Access Denied",
          description: "You are not authorized as admin.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: isSignUp ? "Account Created" : "Login Successful",
        description: isSignUp 
          ? "Admin account created successfully. Redirecting to dashboard..." 
          : "Welcome to the admin dashboard",
      });

      // Refresh auth context and navigate
      await refreshAuth();
      console.log("Navigating to admin dashboard...");
      navigate('/admin-dashboard');
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex justify-center items-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/lovable-uploads/bfe3e178-bae8-49ce-a019-db646e66fe14.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Card className="w-full max-w-sm shadow-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
        <CardHeader className="text-center pb-4 bg-gradient-to-br from-amber-600/80 via-orange-600/80 to-red-600/80 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-red-400/10"></div>
          <div className="relative z-10">
            <CardTitle className="text-xl font-bold mb-1 drop-shadow-lg">
              {isSignUp ? "Create Admin" : "Admin Login"}
            </CardTitle>
            <p className="text-white/90 text-xs font-medium">
              {isSignUp 
                ? "Create administrator account" 
                : "Access dashboard"
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-b from-white/5 to-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 font-semibold text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@woodstockschool.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-orange-400/50 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg h-10 text-white font-medium placeholder:text-white/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 font-semibold text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-orange-400/50 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg h-10 text-white font-medium placeholder:text-white/60"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-6 h-10 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-red-600/90 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold text-sm rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20"
            >
              {loading 
                ? (isSignUp ? 'Creating...' : 'Signing in...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
              className="text-white/80 hover:text-white font-semibold text-xs underline-offset-4 hover:underline p-0"
            >
              {isSignUp 
                ? "Have an account? Sign in" 
                : "Create admin account"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
