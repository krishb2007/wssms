
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";

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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.verifiedOtp) {
      toast({
        title: "Phone number not verified",
        description: "Please verify your phone number before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    nextStep();
  };

  const sendOTP = () => {
    // In a real application, an API call would be made here
    if (formData.phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    // Mock OTP sending
    setOtpSent(true);
    toast({
      title: "OTP Sent",
      description: `An OTP has been sent to ${formData.phoneNumber}. Use code 123456 for testing.`,
    });
  };

  const verifyOTP = () => {
    // In a real application, an API call would be made to verify the OTP
    // For this demo, we'll accept any 6-digit code
    if (otp.length === 6) {
      updateFormData({ verifiedOtp: true });
      toast({
        title: "Phone Number Verified",
        description: "Your phone number has been verified successfully!",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete OTP",
        variant: "destructive",
      });
    }
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
                  verifiedOtp: false 
                });
                setOtpSent(false);
              }}
              placeholder="Enter phone number"
              required
              disabled={formData.verifiedOtp}
            />
            {!formData.verifiedOtp && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={sendOTP} 
                disabled={formData.phoneNumber.length < 10}
              >
                Send OTP
              </Button>
            )}
          </div>
        </div>

        {otpSent && !formData.verifiedOtp && (
          <div className="space-y-4">
            <Label htmlFor="otp">Enter OTP</Label>
            <div className="flex flex-col items-center space-y-4">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              
              <Button 
                type="button" 
                onClick={verifyOTP}
                disabled={otp.length !== 6}
              >
                Verify OTP
              </Button>
            </div>
          </div>
        )}

        {formData.verifiedOtp && (
          <div className="text-green-500 text-center">
            ✓ Phone number verified
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
