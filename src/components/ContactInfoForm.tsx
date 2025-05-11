
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ContactInfoFormProps {
  formData: {
    phoneNumber: string;
    verifiedOtp: boolean;
  };
  updateFormData: (data: Partial<{ phoneNumber: string; verifiedOtp: boolean }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Skip OTP verification, set as verified directly
    updateFormData({ verifiedOtp: true });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
            placeholder="Enter phone number"
            required
          />
        </div>

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
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ContactInfoForm;
