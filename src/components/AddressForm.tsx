
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { MapPin } from "lucide-react";

interface AddressFormProps {
  formData: {
    address: {
      city: string;
      state: string;
      country: string;
    };
  };
  updateFormData: (data: Partial<{ address: { city: string; state: string; country: string } }>) => void;
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

// Major Indian cities by state
const indianCities: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  // Add other states as needed
};

// Default entries for other states
indianStates.forEach(state => {
  if (!indianCities[state]) {
    indianCities[state] = ["Other"];
  }
});

const AddressForm: React.FC<AddressFormProps> = ({
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
            <Combobox
              options={indianStates.map(state => ({ value: state, label: state }))}
              value={formData.address.state}
              onValueChange={(value) => handleAddressChange("state", value)}
              placeholder="Select or search state..."
              searchPlaceholder="Search states..."
              emptyText="No state found."
            />
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

export default AddressForm;
