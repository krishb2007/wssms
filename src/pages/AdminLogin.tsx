
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/lovable-uploads/fb6393ba-f46a-4e08-bd51-911eadf6f6eb.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create Admin Account" : "Admin Login"}
          </CardTitle>
          <p className="text-blue-100 text-sm mt-2">
            {isSignUp 
              ? "Create your administrator account for Woodstock School" 
              : "Access the administrative dashboard"
            }
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@woodstockschool.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
              {loading 
                ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
                : (isSignUp ? 'Create Admin Account' : 'Sign In')
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-semibold"
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
