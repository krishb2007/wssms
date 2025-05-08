
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface ContactInfoFormProps {
  formData: {
    phoneNumber: string;
    verifiedOtp: boolean;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const handleSendOtp = () => {
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would send an API request to send OTP
    const mockOtp = "123456"; // For demo purposes
    console.log("Sending OTP to", formData.phoneNumber, "Mock OTP:", mockOtp);
    
    toast({
      title: "OTP Sent",
      description: `A verification code has been sent to ${formData.phoneNumber}`,
    });
    setOtpSent(true);
  };
  
  const verifyOtp = () => {
    setIsVerifying(true);
    
    // In a real app, you would verify this with your API
    setTimeout(() => {
      // For demo purposes, any 6-digit OTP is valid
      if (otp.length === 6) {
        toast({
          title: "OTP Verified",
          description: "Your phone number has been verified successfully",
        });
        updateFormData({ verifiedOtp: true });
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.verifiedOtp) {
      toast({
        title: "Verification Required",
        description: "Please verify your phone number to continue",
        variant: "destructive",
      });
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="flex space-x-2">
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                updateFormData({ 
                  phoneNumber: e.target.value,
                  verifiedOtp: false // Reset verification when number changes
                });
                setOtpSent(false);
              }}
              placeholder="Enter your phone number"
              required
              disabled={formData.verifiedOtp}
              className="flex-1"
            />
            {!formData.verifiedOtp && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleSendOtp}
                disabled={otpSent && !isVerifying}
              >
                {otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
            )}
          </div>
        </div>

        {otpSent && !formData.verifiedOtp && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <Button 
              type="button" 
              className="w-full"
              onClick={verifyOtp}
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        )}

        {formData.verifiedOtp && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Phone number verified successfully
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!formData.verifiedOtp}
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ContactInfoForm;
