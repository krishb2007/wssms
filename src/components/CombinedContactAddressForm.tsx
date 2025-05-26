import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, PhoneCall } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CombinedContactAddressFormProps {
  formData: {
    phoneNumber: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
  };
  updateFormData: (data: Partial<{ 
    phoneNumber: string;
    address: { city: string; state: string; country: string } 
  }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Country list - just a sample of major countries
const countries = [
  "India", "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "Japan", "China", "Brazil", "Other"
];

// Major Indian states
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CombinedContactAddressForm: React.FC<CombinedContactAddressFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(formData.address.country || "India");

  // Initialize state when component loads
  useEffect(() => {
    setSelectedCountry(formData.address.country || "India");
  }, [formData.address.country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow 10 or 11 digits, but message says 10-digit mobile number
    const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
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

  const handleAddressChange = (field: keyof typeof formData.address, value: string) => {
    updateFormData({
      address: {
        ...formData.address,
        [field]: value,
      },
    });
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    handleAddressChange("country", value);
    
    // Reset state if country changes and it's not India
    if (value !== "India") {
      handleAddressChange("state", "");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Contact & Address Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Mobile Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Enter 10-digit mobile number"
            pattern="[0-9]{10,11}"
            required
          />
          <p className="text-xs text-gray-500">
            Please enter a 10-digit mobile number (no spaces or special characters)
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 mt-6">
          <h4 className="text-lg font-medium">Address Information</h4>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
                required
              >
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCountry === "India" && (
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.address.state}
                  onValueChange={(value) => handleAddressChange("state", value)}
                  required
                >
                  <SelectTrigger id="state" className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
          </div>
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
            <MapPin className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CombinedContactAddressForm;
