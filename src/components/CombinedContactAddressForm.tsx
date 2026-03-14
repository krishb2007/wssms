import React, { useState, useEffect, useRef, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ALL_COUNTRIES } from "@/data/countries";

interface CombinedContactAddressFormProps {
  formData: {
    phoneNumber: string;
    idType: string;
    idNumber: string;
    extraInfo: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
  };
  updateFormData: (data: Partial<{ 
    phoneNumber: string;
    idType: string;
    idNumber: string;
    extraInfo: string;
    address: { city: string; state: string; country: string } 
  }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Major Indian states
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
].sort();

const CombinedContactAddressForm: React.FC<CombinedContactAddressFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(formData.address.country || "India");
  const [stateSearch, setStateSearch] = useState(formData.address.state || "");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState(formData.address.country || "India");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedCountry(formData.address.country || "India");
    setCountrySearch(formData.address.country || "India");
  }, [formData.address.country]);

  useEffect(() => {
    setStateSearch(formData.address.state || "");
  }, [formData.address.state]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
        setShowStateDropdown(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredStates = useMemo(() => {
    if (!stateSearch) return indianStates;
    const lower = stateSearch.toLowerCase();
    return indianStates.filter(s => s.toLowerCase().includes(lower));
  }, [stateSearch]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return ALL_COUNTRIES;
    const lower = countrySearch.toLowerCase();
    return ALL_COUNTRIES.filter(c => c.toLowerCase().includes(lower));
  }, [countrySearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    if (formData.idType === "aadhaar") {
      const aadhaarDigits = formData.idNumber.replace(/\D/g, '');
      if (aadhaarDigits.length !== 12) {
        toast({
          title: "Invalid Aadhaar",
          description: "Please enter a valid 12-digit Aadhaar number",
          variant: "destructive"
        });
        return;
      }
    } else if (formData.idType === "passport") {
      const passportClean = formData.idNumber.trim();
      if (passportClean.length < 8 || passportClean.length > 9) {
        toast({
          title: "Invalid Passport",
          description: "Please enter a valid 8-9 character passport number",
          variant: "destructive"
        });
        return;
      }
    }
    
    nextStep();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setCountrySearch(country);
    handleAddressChange("country", country);
    setShowCountryDropdown(false);
    if (country !== "India") {
      handleAddressChange("state", "");
      setStateSearch("");
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

        {/* Optional ID Type Selection */}
        <div className="space-y-2">
          <Label>Identity Document <span className="text-xs text-gray-400">(Optional)</span></Label>
          <Select
            value={formData.idType || "none"}
            onValueChange={(value) => {
              updateFormData({ idType: value === "none" ? "" : value, idNumber: "" });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select ID type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No ID</SelectItem>
              <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.idType && formData.idType !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="idNumber">
              {formData.idType === "aadhaar" ? "Aadhaar Number (12 digits)" : "Passport Number (8-9 characters)"}
            </Label>
            <Input
              id="idNumber"
              type="text"
              value={formData.idNumber || ""}
              onChange={(e) => {
                if (formData.idType === "aadhaar") {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 12);
                  updateFormData({ idNumber: val });
                } else {
                  const val = e.target.value.toUpperCase().substring(0, 9);
                  updateFormData({ idNumber: val });
                }
              }}
              placeholder={formData.idType === "aadhaar" ? "Enter 12-digit Aadhaar number" : "Enter passport number"}
              required
            />
          </div>
        )}

        {/* Extra Visitor Information - Optional */}
        <div className="space-y-2">
          <Label htmlFor="extraInfo">Extra Visitor Information <span className="text-xs text-gray-400">(Optional)</span></Label>
          <Textarea
            id="extraInfo"
            value={formData.extraInfo || ""}
            onChange={(e) => updateFormData({ extraInfo: e.target.value })}
            placeholder="Any additional information about the visit..."
            rows={3}
          />
        </div>

        <div className="pt-4 border-t border-gray-200 mt-6">
          <h4 className="text-lg font-medium">Address Information</h4>
          
          <div className="space-y-4 mt-4">
            {/* Searchable Country Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative" ref={countryDropdownRef}>
                <Input
                  id="country"
                  type="text"
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setShowCountryDropdown(true);
                    if (!ALL_COUNTRIES.includes(e.target.value)) {
                      handleAddressChange("country", "");
                    }
                  }}
                  onFocus={() => setShowCountryDropdown(true)}
                  placeholder="Type to search country..."
                  required
                  autoComplete="off"
                />
                {showCountryDropdown && filteredCountries.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => handleCountrySelect(country)}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
                {showCountryDropdown && filteredCountries.length === 0 && countrySearch && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
                    No country found.
                  </div>
                )}
              </div>
            </div>

            {selectedCountry === "India" && (
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <div className="relative" ref={stateDropdownRef}>
                  <Input
                    id="state"
                    type="text"
                    value={stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setShowStateDropdown(true);
                      if (!indianStates.includes(e.target.value)) {
                        handleAddressChange("state", "");
                      }
                    }}
                    onFocus={() => setShowStateDropdown(true)}
                    placeholder="Type to search state..."
                    required
                    autoComplete="off"
                  />
                  {showStateDropdown && filteredStates.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => {
                            setStateSearch(state);
                            handleAddressChange("state", state);
                            setShowStateDropdown(false);
                          }}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  )}
                  {showStateDropdown && filteredStates.length === 0 && stateSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
                      No state found.
                    </div>
                  )}
                </div>
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
