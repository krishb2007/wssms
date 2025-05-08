
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PurposeFormProps {
  formData: {
    purpose: string;
    otherPurpose: string;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
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
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose of Visit</Label>
          <Select
            value={formData.purpose}
            onValueChange={(value) => updateFormData({ purpose: value })}
            required
          >
            <SelectTrigger id="purpose" className="w-full">
              <SelectValue placeholder="Select purpose of your visit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visit">Visit</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.purpose === "other" && (
          <div className="space-y-2">
            <Label htmlFor="otherPurpose">Please Specify</Label>
            <Input
              id="otherPurpose"
              value={formData.otherPurpose}
              onChange={(e) => updateFormData({ otherPurpose: e.target.value })}
              placeholder="Please specify your purpose"
              required
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
  );
};

export default PurposeForm;
