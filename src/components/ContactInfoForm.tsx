import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ContactInfoFormProps {
  formData: {
    phoneNumber: string;
  };
  updateFormData: (data: Partial<{ phoneNumber: string }>) => void;
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

    // Validate mobile number length for 9–11 digits
    const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 11) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid mobile number (9 to 11 digits)",
        variant: "destructive"
      });
      return;
    }

    nextStep();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 11 characters
    const value = e.target.value.replace(/\D/g, '').substring(0, 11);
    updateFormData({ phoneNumber: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Mobile Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Enter 9–11 digit mobile number"
            pattern="[0-9]{9,11}"
            required
          />
          <p className="text-xs text-gray-500">
            Please enter a mobile number with 9 to 11 digits (no spaces or special characters)
          </p>
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
