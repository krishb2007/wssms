
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddressFormProps {
  formData: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  updateFormData: (data: Partial<typeof formData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handleAddressChange = (field: keyof typeof formData.address, value: string) => {
    updateFormData({
      address: {
        ...formData.address,
        [field]: value,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={formData.address.street}
            onChange={(e) => handleAddressChange("street", e.target.value)}
            placeholder="Enter street address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            placeholder="Enter city"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.address.state}
            onChange={(e) => handleAddressChange("state", e.target.value)}
            placeholder="Enter state"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.address.zipCode}
            onChange={(e) => handleAddressChange("zipCode", e.target.value)}
            placeholder="Enter ZIP code"
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
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;
