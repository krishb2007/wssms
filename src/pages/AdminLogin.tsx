
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/authService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await signIn({ email, password });

      if (error || !user) {
        toast({
          title: "Login Failed",
          description: error || "Invalid credentials",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You are not authorized as admin.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });

      navigate('/admin-dashboard');
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
          <p className="text-gray-600 text-sm mt-2">Access the administrative dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@woodstockschool.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
