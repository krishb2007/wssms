
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/lovable-uploads/9f80dc1c-4483-4ce6-b359-72d6b0562d60.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md shadow-2xl bg-white border-0 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 bg-black text-white rounded-t-lg">
          <CardTitle className="text-2xl font-black">
            {isSignUp ? "Create Admin Account" : "Admin Login"}
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2 font-bold">
            {isSignUp 
              ? "Create your administrator account for Woodstock School" 
              : "Access the administrative dashboard"
            }
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-black">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@woodstockschool.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-black border-2 border-gray-300 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-black">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-black border-2 border-gray-300 font-bold"
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-black">
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
              className="text-black hover:text-gray-600 font-black"
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
