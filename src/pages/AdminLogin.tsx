
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/lovable-uploads/fb6393ba-f46a-4e08-bd51-911eadf6f6eb.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-6 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20"></div>
          <div className="relative z-10">
            <CardTitle className="text-3xl font-bold mb-2 drop-shadow-lg">
              {isSignUp ? "Create Admin Account" : "Admin Login"}
            </CardTitle>
            <p className="text-white/90 text-sm font-medium">
              {isSignUp 
                ? "Create your administrator account for Woodstock School" 
                : "Access the administrative dashboard"
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-b from-white/95 to-white/90">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-800 font-bold text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@woodstockschool.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-orange-400 border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg h-12 text-gray-800 font-medium placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-800 font-bold text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-orange-400 border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg h-12 text-gray-800 font-medium placeholder:text-gray-500"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-8 h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-base rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading 
                ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
                : (isSignUp ? 'Create Admin Account' : 'Sign In')
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-800 font-bold text-sm underline-offset-4 hover:underline"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Need to create an admin account? Sign up"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
