import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, SignInCredentials } from "@/services/authService";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogIn, Loader } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

// Add phone to credentials interface if not already there:
interface CredentialsWithPhone extends SignInCredentials {
  phone?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState<CredentialsWithPhone>({
    email: "",
    password: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "phone") {
      // Allow only digits, up to 11 characters
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
      setCredentials({
        ...credentials,
        phone: digitsOnly,
      });
    } else {
      setCredentials({
        ...credentials,
        [e.target.name]: e.target.value,
      });
    }
    // Clear error when user makes changes
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await signIn({
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !user) {
        setError(error || "Invalid credentials. Please try again.");
        toast({
          title: "Login Failed",
          description: error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });

      // Small delay to ensure authentication state is fully processed
      setTimeout(() => {
        onLoginSuccess();
        setIsLoading(false);
      }, 500);

    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={credentials.phone || ""}
                onChange={handleChange}
                maxLength={11} // allows up to 11 digits
                disabled={isLoading}
              />
              <div className="text-xs text-gray-500">Enter up to 11 digits only.</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
