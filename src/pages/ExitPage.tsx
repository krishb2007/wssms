import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { LogOut, Phone, CheckCircle } from 'lucide-react';

const ExitPage = () => {
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
      // Use SECURITY DEFINER function to bypass RLS
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

  const handleNewExit = () => {
    setExitedVisitor(null);
    setPhoneNumber('');
  };

  if (exitedVisitor) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('/lovable-uploads/1221534f-c2c7-4956-a2d9-7904946b648b.png')",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="min-h-screen bg-black/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl text-center">
              <div className="mb-6">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                  Exit Successful!
                </h2>
                <p className="text-gray-600">
                  Thank you for visiting Woodstock School
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Exit Details</h3>
                <div className="flex items-center gap-3">
                  {exitedVisitor.picture_url ? (
                    <img
                      src={exitedVisitor.picture_url}
                      alt={exitedVisitor.visitorname}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-gray-500 text-lg font-semibold">
                        {exitedVisitor.visitorname?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 font-semibold">{exitedVisitor.visitorname}</p>
                    <p className="text-xs text-gray-600">People in group: {Number(exitedVisitor.numberofpeople) || 1}</p>
                    
                    <p className="text-xs text-gray-600">
                      Exit: {new Date(exitedVisitor.endtime + '+05:30').toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleNewExit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Record Another Exit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/lovable-uploads/1221534f-c2c7-4956-a2d9-7904946b648b.png')",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="min-h-screen bg-black/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <div className="mb-6 text-center">
              <LogOut className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Visitor Exit
              </h2>
              <p className="text-gray-600">
                Please enter your phone number to record your exit
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full"
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleExit();
                    }
                  }}
                />
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleExit}
                  disabled={isLoading || !phoneNumber.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Recording Exit...
                    </>
                  ) : (
                    'Record Exit'
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                  disabled={isLoading}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitPage;