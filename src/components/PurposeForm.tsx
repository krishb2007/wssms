
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";

interface PurposeFormProps {
  formData: {
    purpose: string;
    otherPurpose: string;
  };
  updateFormData: (data: Partial<{ purpose: string; otherPurpose: string }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PurposeForm: React.FC<PurposeFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.purpose === "other" && !formData.otherPurpose) {
      alert("Please specify your purpose of visit");
      return;
    }
    nextStep();
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Purpose of Visit</Label>
            <RadioGroup
              value={formData.purpose}
              onValueChange={(value) => updateFormData({ purpose: value })}
              className="space-y-2"
            >
             <div className="flex items-center space-x-2">
    <RadioGroupItem value="alumni" id="alumni" />
    <Label htmlFor="alumni">Alumni</Label>
</div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work">Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tourism" id="tourism" />
                <Label htmlFor="tourism">Tourism</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sports" id="sports" />
                <Label htmlFor="sports">Sports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meeting" id="meeting" />
                <Label htmlFor="meeting">Meeting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="official_visit" id="official_visit" />
                <Label htmlFor="official_visit">Official Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student_visit" id="student_visit" />
                <Label htmlFor="student_visit">Student Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.purpose === "other" && (
            <div className="space-y-2">
              <Label htmlFor="otherPurpose">Please specify:</Label>
              <Input
                id="otherPurpose"
                value={formData.otherPurpose}
                onChange={(e) =>
                  updateFormData({ otherPurpose: e.target.value })
                }
                placeholder="Enter purpose of visit"
                required={formData.purpose === "other"}
              />
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
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      </form>
    </CardContent>
  );
};

export default PurposeForm;
