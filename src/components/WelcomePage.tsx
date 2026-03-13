
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, LogOut, Phone } from "lucide-react";

interface WelcomePageProps {
  nextStep: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ nextStep }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exitedVisitor, setExitedVisitor] = useState<any>(null);

  const handleExit = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('record_visitor_exit', {
        p_phonenumber: phoneNumber.trim()
      });

      if (error) {
        throw new Error(`Failed to record exit: ${error.message}`);
      }

      const result = data as { success: boolean; error?: string; visitor?: any };

      if (!result.success) {
        toast({
          title: "Visitor Not Found",
          description: result.error || "No active visitor found with this phone number",
          variant: "destructive",
        });
        return;
      }

      setExitedVisitor(result.visitor);
      setPhoneNumber('');
      
      toast({
        title: "Exit Successful",
        description: `Thank you ${result.visitor.visitorname}! Your exit has been recorded.`,
      });

    } catch (error) {
      console.error("Error during exit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record exit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Woodstock School</h1>
      <p className="text-gray-600">
        Thank you for visiting us. Please complete this registration form to continue.
      </p>
      <div className="pt-4">
        <Button onClick={nextStep} className="w-full">
          Begin Registration
        </Button>
      </div>

      {/* Exit Section */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <LogOut className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800">Visitor Exit</h3>
        </div>

        {exitedVisitor ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Exit recorded successfully!</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
              <p><strong>Visitor:</strong> {exitedVisitor.visitorname}</p>
              <p><strong>Exit Time:</strong> {new Date(exitedVisitor.endtime + '+05:30').toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'short',
                timeStyle: 'short'
              })}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setExitedVisitor(null); setPhoneNumber(''); }}
              className="text-sm"
            >
              Record Another Exit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Already registered? Enter your phone number to exit.</p>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleExit();
                }}
              />
              <Button
                onClick={handleExit}
                disabled={isLoading || !phoneNumber.trim()}
                variant="destructive"
                className="shrink-0"
              >
                {isLoading ? <Spinner size="sm" /> : "Exit"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
